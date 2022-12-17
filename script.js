import data from "data_1.json" assert { type: "json" };

const wetherPrecipitationCanvas = (canvasId, data) => {
  //Canvas data
  let canvas = null;
  let ctx = null;
  let precipitationLevels = null;
  let distance = null;
  //Canvas functions

  //Canvas initialization
  const canvasInit = () => {
    // Getting canvas by ID
    canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.error("No canvas found");
      return;
    }

    //Getting canvas ctx
    ctx = canvas.getContext("2d");

    //Define canvas dimensions
    canvas.width = 460 * 4;
    canvas.height = 250 * 4;

    //Canvas text props
    ctx.font = "60px Poppins light";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    //Distance step
    distance = (canvas.width - 150) / data.length;
  };

  //Data levels min-max definition
  const dataMinMax = (items, value) => {
    if (items.length === 0) return 0;
    if (value === "min") return Math.min(...items).toFixed(2);
    if (value === "max") return Math.max(...items).toFixed(2);
  };

  //Filtering data by level
  const dataValuesFilter = (items, value) => {
    if (value === 2.5)
      return items
        .filter((item) => item.precipitation <= 2.5 && item.precipitation !== 0)
        .map((item) => item.precipitation);
    if (value === 7.5)
      return items
        .filter((item) => item.precipitation > 2.5 && item.precipitation <= 7.6)
        .map((item) => item.precipitation);
    if (value === 7.6)
      return items
        .filter((item) => item.precipitation > 7.6)
        .map((item) => item.precipitation);
  };

  //Data init
  const dataInit = () => {
    precipitationLevels = {
      noPrecipitation: {
        level: 0,
        color: "#caf0f8",
        title: "No precipitations",
        values: [],
        min: () => 0,
        max: () => 0,
      },
      lightRain: {
        level: 2.5,
        color: "#00b4d8",
        title: "Light rain",
        values: dataValuesFilter(data, 2.5),
        min() {
          return dataMinMax(this.values, "min");
        },
        max() {
          return dataMinMax(this.values, "max");
        },
      },
      moderateRain: {
        level: 7.5,
        color: "#0077b6",
        title: "Moderate rain",
        values: dataValuesFilter(data, 7.5),
        min() {
          return dataMinMax(this.values, "min");
        },
        max() {
          return dataMinMax(this.values, "max");
        },
      },
      heavyRain: {
        level: 7.6,
        color: "#03045e",
        title: "Heavy rain",
        values: dataValuesFilter(data, 7.6),
        min() {
          return dataMinMax(this.values, "min");
        },
        max() {
          return dataMinMax(this.values, "max");
        },
      },
    };
  };

  //Draw canvas content
  const drawCanvasContent = () => {
    data.forEach((item, index) => {
      const rectH = index % 15 === 0 ? 500 : 300;
      ctx.beginPath();
      const cX = (index + 2.5) * distance;
      const cY = canvas.height / 2;
      ctx.roundRect(cX, cY - rectH / 2, 20, rectH, 50);
      ctx.strokeStyle = "#fff";
      ctx.fillStyle = rectColorDef(item.precipitation);
      ctx.stroke();
      ctx.fill();
    });
  };

  //Rectangles color definition
  const rectColorDef = (value) => {
    if (value === precipitationLevels.noPrecipitation.level) {
      return precipitationLevels.noPrecipitation.color;
    } else if (
      value <= precipitationLevels.lightRain.level &&
      value < precipitationLevels.moderateRain.level
    ) {
      return precipitationLevels.lightRain.color;
    } else if (value < precipitationLevels.moderateRain.level) {
      return precipitationLevels.moderateRain.color;
    } else if (value > precipitationLevels.heavyRain.level) {
      return precipitationLevels.heavyRain.color;
    }
  };

  //Getting time ref
  const timeDef = (time) => {
    const date = new Date(time * 1000);
    //Getting minutes with option 0 before number
    const getMins =
      date.getMinutes() < 10
        ? `0${date.getMinutes()}`
        : date.getMinutes().toString();
    //Getting minutes with option 0 before number
    const getHours =
      date.getHours() < 10 ? `0${date.getHours()}` : date.getHours().toString();

    return `${getHours}:${getMins}`;
  };

  //Drawing timeline
  const drawTimeline = () => {
    data.forEach((item, index) => {
      const timeStamp = index === 0 ? "now" : `${index}min`;
      const cX = (index + 2.5) * distance;
      if (index % 15 === 0) {
        ctx.beginPath();
        ctx.fillStyle = "#d5d5d5";
        ctx.fillText(timeStamp, cX, 140);
        ctx.beginPath();
        ctx.fillStyle = "#000";
        ctx.fillText(timeDef(item.dt), cX, 60);
      }
    });
  };

  //Drawing legend
  const drawLegend = () => {
    ctx.beginPath();
    ctx.roundRect(0, canvas.height - 220, canvas.width, 100, 20);
    const colorGrad = ctx.createLinearGradient(0, 110, canvas.width, 0);
    colorGrad.addColorStop(0, precipitationLevels.noPrecipitation.color);
    colorGrad.addColorStop(0.25, precipitationLevels.lightRain.color);
    colorGrad.addColorStop(0.5, precipitationLevels.moderateRain.color);
    colorGrad.addColorStop(1, precipitationLevels.heavyRain.color);
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = colorGrad;
    ctx.stroke();
    ctx.fill();
  };

  //Drawing levels scale
  const drawLevelsScale = () => {
    const precipitationLevelsLength = Object.keys(precipitationLevels).length;
    Object.values(precipitationLevels).forEach((item, index) => {
      const posXRatio = canvas.width / precipitationLevelsLength;
      const rectSideSizeX = canvas.width / precipitationLevelsLength;
      const rectSideSizeY = 80;
      const posX = posXRatio * index;
      const posY = canvas.height * 0.8;

      let precipitationScale = "0mm/h";
      //Output with values
      if (item.level !== 0)
        precipitationScale = `${item.min()}-${item.max()}mm/h`;

      //Output incase no values

      if (!item.values.length && item.level === 2.5)
        precipitationScale = `<2.5mm/h`;
      if (!item.values.length && item.level === 7.5)
        precipitationScale = `<7.5mm/h`;
      if (!item.values.length && item.level === 7.6)
        precipitationScale = `>7.6mm/h`;

      ctx.beginPath();
      ctx.fillStyle = "#fff";
      ctx.font = "45px Poppins light";
      ctx.fillText(
        precipitationScale,
        posX + rectSideSizeX / 2,
        posY + rectSideSizeY / 2
      );
    });
  };

  //Init canvas func
  const initCanvas = () => {
    canvasInit();
    dataInit();
  };

  //Draw canvas func
  const drawCanvas = () => {
    drawTimeline();
    drawCanvasContent();
    drawLegend();
    drawLevelsScale();
  };

  //Start function
  const start = () => {
    initCanvas();
    drawCanvas();
  };

  console.time();
  start();
  console.timeEnd();
};

wetherPrecipitationCanvas("canvas", data);
