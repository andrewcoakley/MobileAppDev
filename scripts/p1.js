/*
  Authors:
      Andrew Coakley (A00398990)
      Amr Ghoneim (A00425709)
      Keenan King (A00401667)
      Jalen Pinder (A00420851)

    The purpose of this file is to provide function definitions for the p1.html file.
*/

// scale factor
const SCL = 1.35;

/* This function sets up the context for the canvases and draws the initial view that you
   see of them.

   No inputs.
   Void
 */
function setup() {
  document.getElementById("insulation").style.visibility = "hidden";

  //--------------------Canvases------------------------------------
  let plan = document.getElementById("plan");
  let contextP = plan.getContext("2d");
  let elevation = document.getElementById("elevation");
  let contextE = elevation.getContext("2d");

  contextP.clearRect(0, 0, plan.width, plan.height);
  contextE.clearRect(0, 0, elevation.width, elevation.height);

  // --------------------Initial view of the plan -----------------------------
  // slab
  contextP.fillStyle = "#d2cbcd"; // concrete porch
  contextP.fillRect(0, 0, plan.width, plan.height);

  // outer skin
  contextP.fillStyle = "#3104fb"; // blue
  contextP.fillRect(0, 0, plan.width, 96 * SCL);

  // inner skin
  contextP.fillStyle = "#3104fb"; // blue
  contextP.fillRect(2 * SCL, 2 * SCL, plan.width - 4 * SCL, 96 * SCL - 4 * SCL);

  // interior floor
  contextP.fillStyle = "#d2cbcd"; // concrete
  contextP.fillRect(3 * SCL, 3 * SCL, plan.width - 6 * SCL, 96 * SCL - 6 * SCL);

  // Wipe with concrete
  contextP.fillStyle = "#d2cbcd"; // concrete
  contextP.fillRect(plan.width - 6 * SCL, 96 * SCL, plan.width, plan.height);

  // dotted arc to show the door's movement
  contextP.beginPath();
  contextP.arc(
    100 * SCL + Number(75),
    plan.height / SCL,
    SCL * 36 - Number(5),
    0,
    Math.PI / 2
  );
  contextP.stroke();

  // the door
  contextP.setLineDash([]);
  contextP.lineWidth = "3";
  contextP.strokeStyle = "black";
  contextP.beginPath();
  contextP.moveTo(plan.width / SCL - Number(30), 96 * SCL);
  contextP.lineTo(
    plan.width / SCL - Number(30),
    plan.height / SCL + 36 * SCL - Number(5)
  );
  contextP.stroke();

  // wipe doorway with concrete
  contextP.fillStyle = "#d2cbcd"; // concrete
  contextP.fillRect(
    plan.width / SCL - Number(30),
    plan.height / SCL - Number(42),
    Number(48),
    Number(41)
  );

  // reset line width
  contextP.lineWidth = "1";

  // doorway inner threshold
  contextP.setLineDash([4, 3]);
  contextP.beginPath();
  contextP.moveTo(
    plan.width / SCL - Number(30),
    plan.height / SCL - 2 / SCL - 2 * SCL - 1
  );
  contextP.lineTo(
    plan.width / SCL - Number(30) + SCL * 36,
    plan.height / SCL - 2 / SCL - 2 * SCL - 1
  );
  contextP.stroke();

  // doorway outer threshold
  contextP.beginPath();
  contextP.moveTo(plan.width / SCL - Number(30), 96 * SCL);
  contextP.lineTo(plan.width / SCL - Number(30) + SCL * 36, 96 * SCL);
  contextP.stroke();

  //--------------Initial view of the elevation ------------------------------
  // elevation wall
  contextE.fillStyle = "#a3bcfd"; // light blue to give hint
  contextE.fillRect(0, 0, elevation.width, elevation.height);

  // outer solid black circle
  contextE.fillStyle = "black";
  contextE.fillRect(
    200,
    elevation.height - 80 * SCL - 7 * SCL + 2,
    36 * SCL,
    80 * SCL + 1
  );

  // inner solid blue circle
  contextE.fillStyle = "#a3bcfd";
  contextE.fillRect(
    204,
    elevation.height - 80 * SCL - 7 * SCL + 6,
    36 * SCL - 8,
    80 * SCL - 7
  );

  // middle non-filled blue circle to create double black line
  contextE.lineWidth = "2";
  contextE.strokeStyle = "#a3bcfd";
  contextE.beginPath();
  contextE.rect(
    202,
    elevation.height - 80 * SCL - 7 * SCL + 4,
    36 * SCL - 4,
    80 * SCL - 3
  );
  contextE.stroke();

  // black circle in the middle
  contextE.strokeStyle = "black";
  contextE.beginPath();
  contextE.arc(235, 95, 3, 0, 2 * Math.PI);
  contextE.stroke();

  //---------------------Get the values---------------------------
  // set initial slider value 2" output for display purposes only
  $("#planSldOut").val(2);

  // set initial slider value 0" output for display purposes only
  $("#windowSldOut").val(0);

  // set opaque thermal resistance output
  $("#wallOut").val("");

  // set window thermal resistance slider to 1
  $("#F").val(1);

  // set door thermal resistance slider to 1
  $("#E").val(2);

  // register the wall thickness slider
  $("#planSld").on("change", function () {
    processInput();
  });

  // register the window thickness slider
  $("#windowSld").on("change", function () {
    processInput();
  });

  // register the window thermal resistance slider
  $("#W").on("change", function () {
    processInput();
  });

  // register the door thermal resistance slider
  $("#winSlider").on("change", function () {
    processInput();
  });
}

// a counter variable for the subsequent function
var counter = 0;

/* This function shows/hides the insulation page when the appropriate option is selected
   from the VIEW CHAPTERS dropdown menu.
   
   No input
   Void
*/
function hide() {
  if (counter % 2 == 0) {
    document.getElementById("insulation").style.visibility = "visible";
  } else {
    document.getElementById("insulation").style.visibility = "hidden";
  }
  counter++;
}

/* 
  This function grabs the appropriate information from the sliders/drop-down menus and
  calls the draw function with that information.

  No input
  Void
*/
function processInput() {
  let construction = $("#planSld").val();
  let constructionType = $("#construction option:selected").val();
  let place = $("#place option:selected").val();
  let window = $("#windowSld").val();
  let rInch = $("#construction").find(":selected").text();

  draw(construction, window, rInch);
  calculate(construction, window, constructionType, place);
}

/* 
  This function continually updates the canvases as the corresponding sliders 
  are moved.

  Input:
    - construction (thickness of the walls)
    - window (size of the window)
    - rInch (which material is used)
  Void
*/
function draw(construction, window, rInch) {
  let plan = document.getElementById("plan");
  let contextP = plan.getContext("2d");
  let elevation = document.getElementById("elevation");
  let contextE = elevation.getContext("2d");

  contextP.clearRect(0, 0, plan.width, plan.height);
  contextE.clearRect(0, 0, elevation.width, elevation.height);

  // PLAN *********************************************************************
  // slab
  contextP.fillStyle = "#d2cbcd"; // concrete porch
  contextP.fillRect(0, 0, plan.width, plan.height);
  // outer skin
  contextP.fillStyle = "#3104fb"; // blue
  contextP.fillRect(0, 0, plan.width, 96 * SCL); // based on: 8ft (or 96') x 1.35 = 126px

  // Construction Type (R-Inch button)
  if (rInch == "Plus Interior Finish, Uninsulated (R2)") {
    contextP.fillStyle = "#e8e5e4";
  } else if (rInch == "Plus Finish and Cellulose (R3/in)") {
    contextP.fillStyle = "#fec7d4";
  } else if (rInch == "Plus Finish and Fiberglass (R3/in)") {
    contextP.fillStyle = "#fdfaaa";
  } else {
    contextP.fillStyle = "#d2cbcd"; // concrete
  }

  // interior of wall
  contextP.fillRect(1, 1, plan.width - 2, 96 * SCL - 2);

  // inner skin
  contextP.fillStyle = "#3104fb"; // blue
  contextP.fillRect(
    (construction * SCL) / 2 + Number(2),
    (construction * SCL) / 2 + Number(2),
    plan.width - construction * SCL - 4,
    plan.height / SCL - SCL * construction - 6
  );

  // interior floor
  contextP.fillStyle = "#d2cbcd"; // concrete
  contextP.fillRect(
    (construction * SCL) / 2 + Number(3),
    (construction * SCL) / 2 + Number(3),
    plan.width - construction * SCL - 6,
    plan.height / SCL - SCL * construction - 8
  );

  // plan wipe with concrete
  contextP.fillStyle = "#d2cbcd"; // concrete
  contextP.fillRect(
    85 * SCL - window * SCL,
    plan.height / SCL - construction * SCL - 2 * SCL,
    2 * window * SCL,
    construction * SCL + Number(2 * SCL)
  );

  // plan window
  contextP.fillStyle = "#07ebf8"; // glass
  contextP.fillRect(
    85 * SCL - window * SCL,
    plan.height / SCL - construction / SCL - 2 * SCL,
    2 * window * SCL,
    construction / SCL
  );

  // plan window inner threshold
  contextP.setLineDash([4, 3]);
  contextP.beginPath();
  contextP.moveTo(
    85 * SCL - window * SCL,
    plan.height / SCL - construction / SCL - 2 * SCL - 1
  );
  contextP.lineTo(
    85 * SCL + Number(window * SCL),
    plan.height / SCL - construction / SCL - 2 * SCL - 1
  );
  contextP.stroke();

  // plan window outer threshold
  contextP.beginPath();
  contextP.moveTo(85 * SCL - window * SCL, 96 * SCL);
  contextP.lineTo(85 * SCL + Number(window * SCL), 96 * SCL);
  contextP.stroke();

  // dotted arc to show the door's movement
  contextP.beginPath();
  contextP.arc(
    100 * SCL + Number(75),
    plan.height / SCL,
    SCL * 36 - Number(5),
    0,
    Math.PI / 2
  );
  contextP.stroke();

  // the door
  contextP.setLineDash([]);

  contextP.strokeStyle = "black";
  contextP.beginPath();
  contextP.moveTo(plan.width / SCL - Number(30), 96 * SCL);
  contextP.lineTo(
    plan.width / SCL - Number(30),
    plan.height / SCL + 36 * SCL - Number(5)
  );
  contextP.stroke();

  // wipe doorway with concrete
  contextP.fillStyle = "#d2cbcd"; // concrete
  contextP.fillRect(
    plan.width / SCL - Number(30),
    plan.height / SCL - Number(42),
    Number(48),
    Number(41)
  );

  // reset line width
  contextP.lineWidth = "1";

  // doorway inner threshold
  contextP.setLineDash([4, 3]);
  contextP.beginPath();
  contextP.moveTo(
    plan.width / SCL - Number(30),
    plan.height / SCL - construction / SCL - 2 * SCL - 1
  );
  contextP.lineTo(
    plan.width / SCL - Number(30) + SCL * 36,
    plan.height / SCL - construction / SCL - 2 * SCL - 1
  );
  contextP.stroke();

  // doorway outer threshold
  contextP.beginPath();
  contextP.moveTo(plan.width / SCL - Number(30), 96 * SCL);
  contextP.lineTo(plan.width / SCL - Number(30) + SCL * 36, 96 * SCL);
  contextP.stroke();

  // ELEVATION ****************************************************************
  // elevation wall
  contextE.fillStyle = "#a3bcfd"; // light blue to give hint
  contextE.fillRect(0, 0, elevation.width, elevation.height);

  // ----------------------fixed door-----------------------
  // outer solid black circle
  contextE.fillStyle = "black";
  contextE.fillRect(
    200,
    elevation.height - 80 * SCL - 7 * SCL + 2,
    36 * SCL,
    80 * SCL + 1
  );

  // inner solid blue circle
  contextE.fillStyle = "#a3bcfd";
  contextE.fillRect(
    204,
    elevation.height - 80 * SCL - 7 * SCL + 6,
    36 * SCL - 8,
    80 * SCL - 7
  );

  // middle non-filled blue circle to create double black line
  contextE.lineWidth = "2";
  contextE.strokeStyle = "#a3bcfd";
  contextE.beginPath();
  contextE.rect(
    202,
    elevation.height - 80 * SCL - 7 * SCL + 4,
    36 * SCL - 4,
    80 * SCL - 3
  );
  contextE.stroke();

  // black circle in the middle
  contextE.strokeStyle = "black";
  contextE.beginPath();
  contextE.arc(235, 95, 3, 0, 2 * Math.PI);
  contextE.stroke();

  //-----------------------------adjustable window-------------------------------
  // elevation window 4 x 3 aspect ratio
  // elevation window frame
  // black
  contextE.fillStyle = "black";
  if (window > 0) {
    contextE.fillRect(
      100 * SCL - window * SCL - 22,
      25 * SCL + 5,
      2 * window * SCL + Number(6),
      Number(((3 * window) / 2) * SCL) + Number(11)
    );
  }
  // blue
  contextE.fillStyle = "#a3bcfd";
  contextE.fillRect(
    101 * SCL - window * SCL - 22,
    26 * SCL + 5,
    2 * window * SCL + Number(3),
    Number(((3 * window) / 2) * SCL) + Number(8)
  );
  // elevation window
  // black
  contextE.fillStyle = "black";
  contextE.fillRect(
    102 * SCL - window * SCL - 22,
    27 * SCL + 5,
    2 * window * SCL,
    Number(((3 * window) / 2) * SCL) + Number(5)
  );
  // blue
  contextE.fillStyle = "#a3bcfd";
  contextE.fillRect(
    103 * SCL - window * SCL - 22,
    28 * SCL + 5,
    2 * window * SCL - 2,
    Number(((3 * window) / 2) * SCL) + Number(3)
  );
}

/* 
  This function controls the calculations. 

  Input:
    - construction (thickness of the walls)
    - window (size of the window)
    - constructionType (will be used in subsequent calculations)
    - place comes from the places with degrees days button
  Void
*/
function calculate(construction, window, constructionType, place) {
  // update slider value outputs for display purposes only
  if (construction >= 8) {
    $("#planSldOut").val(construction / 2);
  }

  // output window area in square feet to one decimal place, truncated not rounded
  let windowWidth = (window / 12) * (9 / 12) * 3;
  let windowArea = windowWidth * ((windowWidth * 3) / 4);
  let windowAreaTrunc = Math.trunc(Number(windowArea) * 10) / 10; // G
  $("#windowSldOut").val(windowAreaTrunc);

  // opaque thermal resistance output (D)  ######FIX##########MINTUE 70 OF LECTURE##################
  let wallR = 0; // D
  if (construction >= 8 && constructionType != "top") {
    let test = $("#planSldOut").val();
    let DTI = test - 2;
    let materialR = $("#construction option:selected").val();
    wallR = 2 + DTI * materialR;
    $("#wallOut").val(wallR);
  }

  // window thermal resistance (F)
  let WTR = $("#W").val();
  $("#F").val(WTR);

  // door thermal resistance (E)
  let DTR = $("#winSlider").val();
  $("#E").val(DTR);

  // effective overall thermal resistance output (H)
  let EOTR = 0; // H

  if (construction >= 8 && constructionType != "top") {
    EOTR =
      1 /
      (((800 - windowAreaTrunc) / wallR + windowAreaTrunc / WTR + 20 / DTR) /
        820);
    $("#H").val(Math.trunc(EOTR));
  }

  // annual energy (I)
  let AE = 0; // I

  if (construction >= 8 && constructionType != "top" && place != "top") {
    AE =
      (820 * place * 1.8 * 24) / EOTR / 3412 +
      (place * 1.8 * 24 * 65) / 3412 +
      3000;

    $("#I").val(Math.trunc(AE));
  }
}

/* This function controls the text displayed by the concepts button. It displays text
   to the bottom of the screen based on which item is selected.

   No parameters
   Void
*/
function textSwitch() {
  let choice = $("#conceptsDrop").val();

  if (choice == "local conditions") {
    document.getElementById("conceptsText").innerHTML =
      "Local Conditions: <br><br> Heating demand is given in heating degree-days." +
      "The length of a Canadian heating season is the number of days below 18&#xb0;C. " +
      "Coldness is the difference between a <br> desired indoor temperature of 20&#xb0;C " +
      "and the average outdoor temperature on those days.<br><br>" +
      "Humidity and especially windiness of a location also add to heating demand but are discussed elsewhere.<br><br>" +
      "Warmer climates also imply a cooling load: also a subject for other chapters.<br><br>" +
      "Please note that to reflect the Canadian experience, this app mixes units: Celsius for temperature, " +
      "for example, but inches and feet for dimensions.";
  } else if (choice == "annual energy budget") {
    document.getElementById("conceptsText").innerHTML =
      "Annual Energy Budget<br><br> Envelope heat loss is only past of an energy budget." +
      "Envelope heat loss is only part of an energy budget. Lights, hot water applicances " +
      "and electronics also consume energy. In this chapter those other loads are fixed, " +
      "on the assumption that use of the building remains contant in all locations.<br><br>" +
      "Envelope heat loss has at least two components: the effectively conductive losses that " +
      "can be reduced by insulation, and losses due to ventilation and drafts. Both are " +
      "proportional to heating demand. Looking at the Energy Budget graph. You will see" +
      " that changing the insulation levels changes the conductive or insulation losses " +
      "but not those due to air movement.";
  } else if (choice == "drafts and ventilation") {
    document.getElementById("conceptsText").innerHTML =
      "Drafts and Ventilation<br><br>Realistically, a larger window would admit more " +
      "drafts, especially at the lower end of the quality scale, but that effect is " +
      "ignored in the insulation chapter.<br><br>The Drafts and Ventilation chapter " +
      "explains how energy losses due to infiltration are controlled by membranes, " +
      "sealants, joint design, and meticulous quality control. It shows how ventilation " +
      "losses can be managed through heat exchange, flow controls, and careful use of " +
      "operable windows and vents.";
  } else if (choice == "insulation and heat loss") {
    document.getElementById("conceptsText").innerHTML =
      "Insulation and Heat Loss<br><br>In North America, thermal resistance is measured in " +
      "R-Values. The resistance of a material barrier is a product of its resistivity. " +
      "In R/inch, and the inches of thickness. The actual effectiveness of insulation " +
      "depends on installation and other factors, but this app gives drywall an R/inch " +
      "of 1, fiberglass and cellulose insulation an R/inch of 3, and urethane spray foam " +
      "spray foam an R/inch of 6.<br><br>In thin and poorly and insulation assembles, " +
      "air films become significant. This is how painted sheet steel ends up with a " +
      "nominal R of 1. When assembles are layered, R values can simply be totalled.";
  } else if (choice == "materials and insulation") {
    document.getElementById("conceptsText").innerHTML =
      "Materials and Insulation<br><br>Heat flow is inversely related to thermal resistance. " +
      "The conduction of heat through a material is given as a U value, which equals to 1/R. " +
      "Add layers into a single R value before finding their U value.<br><br>Heat loss is a " +
      "product of surface area and conductance.<br><br>The total thermal liability of an " +
      "envelope is a sum of the liability of its portions. Average conductance divides " +
      "the total liability by the total area. The effective R-value of an envelope " +
      "is the inverse of average conductance.<br><br>Note that high R-value portions " +
      "of an envelope have a smaller effect on the effective R-value than might be supposed. " +
      "Conversely, low R-value portions of an envelope such as windows have a larger effect on " +
      "overall heat loss than their small area may suggest.";
  } else if (choice == "environmental impact") {
    document.getElementById("conceptsText").innerHTML =
      "Environmental Impact<br><br>The environmental impact of construction depends " +
      "not only on the energy consumed in perating a building, but in the energy consumed " +
      "or 'embodied' in the material through sourcing, manufacture, transport, and assembly. " +
      "Additionally, toxins and other ecological and social injuries need to be accounted " +
      "for. The exact calculations are complicated and debatable, but that's no reason " +
      "to ignore them. They are the subject of several other chapters.";
  }
}
