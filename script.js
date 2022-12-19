const wetherPrecipitationCanvas = (canvasId, data) => {
  //Canvas data
  let canvas = null;
  let ctx = null;
  let precipitationLevels = null;
  let distance = null;
  let rectangleProps = [];
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
    canvas.width = 460 * 2;
    canvas.height = 250 * 2;

    //Canvas text props
    ctx.font = "30px Poppins light";
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
        values: dataValuesFilter(data, 7.5),
        min() {
          return dataMinMax(this.values, "min");
        },
        max() {
          return dataMinMax(this.values, "max");
        },
      },
    };
  };

  const rectangleDataInit = () => {
    rectangleProps = [];
    const rectWidth = 10;
    const contentGap = 3;
    const contentWidth = (rectWidth + contentGap) * data.length;
    const startPoint = (canvas.width - contentWidth) / 2;
    data.forEach((item, index) => {
      const rectHeight = index % 15 === 0 ? 200 : 100;
      const newCx = (rectWidth + contentGap) * index;
      const cX = startPoint + newCx + 4;
      const rectY = canvas.height / 2;
      const cY = rectY - rectHeight / 2;

      const coordinates = {
        x: cX,
        Y: cY,
        W: rectWidth,
        H: rectHeight,
        precipitation: item.precipitation,
        date: item.dt,
      };
      rectangleProps.push(coordinates);
    });
  };

  //Draw canvas content
  const drawCanvasContent = () => {
    rectangleProps.forEach((item, index) => {
      ctx.beginPath();
      ctx.moveTo(item.x, item.Y);
      ctx.lineWidth = 1;
      ctx.roundRect(item.x, item.Y, item.W, item.H, 20);
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
      value > precipitationLevels.noPrecipitation.level &&
      value <= precipitationLevels.lightRain.level
    ) {
      return precipitationLevels.lightRain.color;
    } else if (
      value > precipitationLevels.lightRain.level &&
      value <= precipitationLevels.moderateRain.level
    ) {
      return precipitationLevels.moderateRain.color;
    } else if (value >= precipitationLevels.moderateRain.level) {
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
    rectangleProps.forEach((item, index) => {
      const timeStamp = index === 0 ? "now" : `${index}min`;
      // const cX = (index + 5.5) * distance;
      if (index % 15 === 0) {
        ctx.beginPath();
        ctx.fillStyle = "#d5d5d5";
        ctx.font = "30px Poppins light";
        ctx.fillText(timeStamp, item.x, 120);
        ctx.fillStyle = "#000";
        ctx.fillText(timeDef(item.date), item.x, 60);
      }
    });
  };

  //Drawing legend
  const drawLegend = () => {
    ctx.beginPath();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.roundRect(1, canvas.height - 120, canvas.width - 2, 50, 20);
    const colorGrad = ctx.createLinearGradient(0, 110, canvas.width, 0);
    colorGrad.addColorStop(0, precipitationLevels.noPrecipitation.color);
    colorGrad.addColorStop(0.25, precipitationLevels.lightRain.color);
    colorGrad.addColorStop(0.5, precipitationLevels.moderateRain.color);
    colorGrad.addColorStop(1, precipitationLevels.heavyRain.color);

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
      const rectSideSizeY = 20;
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

      ctx.fillStyle = "white";
      ctx.font = "22px Poppins light";
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
    rectangleDataInit();
  };

  //Mouse move handler
  const mouseMoveHandler = () => {
    canvas.addEventListener("mousemove", (event) => {
      const canvasCoordinates = canvas.getBoundingClientRect();
      const mousePosX = (event.clientX - canvasCoordinates.left) * 2;
      const mousePosY = (event.clientY - canvasCoordinates.top) * 2;
      // console.log(mousePosX);
      // rectangleDataInit();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCanvas();
      rectangleProps.forEach((item, index) => {
        const gapSize = 1.6;

        if (
          mousePosX > item.x - gapSize &&
          mousePosX < item.x + item.W + gapSize &&
          mousePosY >= item.Y &&
          mousePosY <= item.Y + item.H
        ) {
          ctx.beginPath();
          ctx.fillStyle = rectColorDef(item.precipitation);
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#fff";
          ctx.moveTo(mousePosX, item.Y);
          ctx.bezierCurveTo(
            mousePosX - 10,
            item.Y - 20,
            mousePosX - 40,
            item.Y - 10,
            mousePosX - 40,
            item.Y - 30
          );
          ctx.lineTo(mousePosX - 40, item.Y - 60);
          ctx.quadraticCurveTo(
            mousePosX - 40,
            item.Y - 80,
            mousePosX,
            item.Y - 80
          );
          ctx.quadraticCurveTo(
            mousePosX + 40,
            item.Y - 80,
            mousePosX + 40,
            item.Y - 60
          );
          ctx.lineTo(mousePosX + 40, item.Y - 30);
          ctx.bezierCurveTo(
            mousePosX + 40,
            item.Y - 10,
            mousePosX + 10,
            item.Y - 20,
            mousePosX,
            item.Y
          );

          ctx.closePath();

          ctx.stroke();
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = "18px Poppins light";

          ctx.fillText(item.precipitation.toFixed("2"), mousePosX, item.Y - 42);
          ctx.font = "14px Poppins light";
          ctx.fillText("mm/h", mousePosX, item.Y - 25);
          ctx.fillStyle = "#d5d5d5";
          ctx.fillText(timeDef(item.date), mousePosX, item.Y - 63);
          timeDef;
        }
      });
    });
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
    mouseMoveHandler();
  };

  console.time();
  start();
  console.timeEnd();
};

fetch("https://inmorpher.github.io/wethercanvas/data_1.json")
  .then((response) => response.json())
  .then((data) => wetherPrecipitationCanvas("canvas", data));
