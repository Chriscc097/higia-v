const { DateTime } = require("luxon");

function format(inputDate) {
  const date = new Date(inputDate.seconds * 1000);
  const now = new Date();

  const seconds = Math.floor((now - date) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval >= 1) {
    return interval === 1 ? "Hace " + interval + " año" : "Hace " + interval + " años";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? "Hace " + interval + " mes" : "Hace " + interval + " meses";
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? "Hace " + interval + " día" : "Hace " + interval + " días";
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? "Hace " + interval + " hora" : "Hace " + interval + " horas";
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? "Hace " + interval + " minuto" : "Hace " + interval + " minutos";
  }
  return seconds === 1 ? "Hace " + interval + " segundo" : "Hace " + interval + " segundos";
}

function formatDate(date) {
  const today = new Date();
  const hourString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Helper function to format date as dd/mm/yy
  const formatDateAsDDMMYY = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear().toString().slice(-2); // Last 2 digits of the year
    return day + "/" + month + "/" + year;
  };

  // Helper function to get the day of the week
  const getDayOfWeek = (date) => {
    return nombresDias[date.getDay()];
  };

  // Check if the input date is today

  if (date.toDateString() === today.toDateString()) {
    return hourString;
  }

  // Check if the input date is yesterday
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Ayer, " + hourString;
  }

  // Check if the input date is within the last 7 days
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  if (date >= oneWeekAgo) {
    return getDayOfWeek(date) + ", " + hourString;
  }

  // For all other cases, return the date in dd/mm/yy format
  return formatDateAsDDMMYY(date) + ", " + hourString;
}

function getAnniversary(originalDate) {
  // Obtener el año actual
  const currentYear = new Date().getFullYear();

  const updatedDate = new Date(originalDate);
  updatedDate.setFullYear(currentYear);

  const today = new Date();
  if (updatedDate < today) {
    updatedDate.setFullYear(currentYear + 1);
  }

  return updatedDate;
}

function dateToYYYYMMDD(fecha) {
  const date = new Date(fecha);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const formated = year + "-" + month + "-" + day;
  return formated;
}

export function dateToDDMMYYYY(fecha) {
  const date = new Date(fecha);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); 
  const day = (date.getDate()).toString().padStart(2, "0");
  return `${day}/${month}/${year}`;
}

export function parseToGMTMinus5(value) {
  // Si el string no tiene 'Z' ni offset, se asume local, así que lo forzamos a UTC
  const utcDate = new Date(value + 'Z');
  // Restamos 5 horas para GMT-5
  return new Date(utcDate.getTime() - 5 * 60 * 60 * 1000);
}

function stringDateHourToDate(dateString, timeString) {
  try {
    // Combinar la fecha y la hora en un solo string
    const combinedString = dateString + "T" + timeString;
    // Convertirlo en un objeto Date
    const date = new Date(combinedString);

    // Validar si la fecha es válida
    if (isNaN(date.getTime())) {
      throw new Error("Fecha u hora no válidas");
    }

    return date;
  } catch (error) {
    console.error("Error al combinar fecha y hora:", error.message);
    return null; // Retorna null en caso de error
  }
}


function addTimeToDate(fechaOriginal, cantidad, unidad) {
  // Crear una copia de la fecha original para no modificarla directamente
  const nuevaFecha = new Date(fechaOriginal.getFullYear(), fechaOriginal.getMonth(), fechaOriginal.getDate(), fechaOriginal.getHours(), fechaOriginal.getMinutes(), 0, 0);
  // Determinar la unidad de tiempo y sumar la cantidad correspondiente
  switch (unidad) {
    case "a": // Años
      nuevaFecha.setFullYear(nuevaFecha.getFullYear() + cantidad);
      break;
    case "M": // Meses
      nuevaFecha.setMonth(nuevaFecha.getMonth() + cantidad);
      break;
    case "d": // Días
      nuevaFecha.setDate(nuevaFecha.getDate() + cantidad);
      break;
    case "h": // Horas
      nuevaFecha.setHours(nuevaFecha.getHours() + cantidad);
      break;
    case "m": // Minutos
      nuevaFecha.setMinutes(nuevaFecha.getMinutes() + cantidad);
      break;
    default:
      throw new Error("Unidad de medida no válida");
  }
  return nuevaFecha;
}

function getAge(date) {
  const diff = new Date().getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function stringToDate(dateString) {
  const splited = dateString.split("-");
  const dia = splited[2];
  const mes = splited[1];
  const ann = splited[0];
  return new Date(ann, mes - 1, dia);
}

const nombresDias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function isBusinessDay(date) {
  const d = date.getDay();
  if (nombresDias[d] === "Domingo") {
    return false;
  }
  return !isHoliday(date);
}

function nextBusinessDay(inputDate) {
  let date = addDaysToDate(new Date(inputDate), 1);
  while (!isBusinessDay(date)) {
    date = addDaysToDate(date, 1);
  }
  return date;
}

function lastBusinessDay(inputDate) {
  let date = addDaysToDate(new Date(inputDate), -1);
  while (!isBusinessDay(date)) {
    date = addDaysToDate(date, -1);
  }
  return date;
}

function addDaysToDate(inputDate, days) {
  const date = new Date(inputDate);
  const secondDate = date;
  secondDate.setDate(date.getDate() + days);
  return secondDate;
}

function dateToLongString(fecha) {
  if (!fecha) return;
  let hora = fecha.getHours();
  let ampm = "AM";
  if (hora > 12) {
    hora = hora - 12;
    ampm = "PM";
  }
  const horaString = hora.toString().padStart(2, "0");
  let aLas = " a las ";
  if (horaString === "1") aLas = " a la ";
  const minutoString = fecha.getMinutes().toString().padStart(2, "0");
  return nombresDias[fecha.getDay()] + " " + fecha.getDate() + " de " + nombresMeses[fecha.getMonth()] + " del " + fecha.getFullYear() + aLas + horaString + ":" + minutoString + " " + ampm;
}

function getWeekDay(fechaDate) {
  return nombresDias[fechaDate.getDay()];
}

function dateToUTC(fecha) {
  return DateTime.fromJSDate(fecha).setZone("00:00");
}

function dateIsBefore(fecha1, fecha2) {
  // Convertir las entradas a objetos de fecha si no lo son
  fecha1 = new Date(fecha1);
  fecha2 = new Date(fecha2);

  // Comparar las fechas
  return fecha1 < fecha2;
}

const HOLIDAYS = [
  { date: "01/01", nextMonday: false, name: "Año Nuevo", type: "holiday" },
  { date: "01/02", nextMonday: false, name: "Año Nuevo", type: "holiday" },
  { date: "01/03", nextMonday: false, name: "Año Nuevo", type: "holiday" },
  { date: "01/04", nextMonday: false, name: "Año Nuevo", type: "holiday" },
  { date: "01/05", nextMonday: false, name: "Año Nuevo", type: "holiday" },
  { date: "01/06", nextMonday: true, name: "Día de los Reyes Magos", type: "holiday" },
  { date: "03/19", nextMonday: true, name: "Día de San José", type: "holiday" },
  { daysToSum: -3, nextMonday: false, name: "Jueves Santo", type: "holiday" },
  { daysToSum: -2, nextMonday: false, name: "Viernes Santo", type: "holiday" },
  { daysToSum: -1, nextMonday: false, name: "Sabado Santo", type: "holiday" },
  { date: "05/01", nextMonday: false, name: "Día del Trabajo", type: "holiday" },
  { daysToSum: 40, nextMonday: true, name: "Ascensión del Señor", type: "holiday" },
  { daysToSum: 60, nextMonday: true, name: "Corphus Christi", type: "holiday" },
  { daysToSum: 71, nextMonday: true, name: "Sagrado Corazón de Jesús", type: "holiday" },
  { date: "06/29", nextMonday: true, name: "San Pedro y San Pablo", type: "holiday" },
  { date: "07/20", nextMonday: false, name: "Día de la Independencia", type: "holiday" },
  { date: "08/07", nextMonday: false, name: "Batalla de Boyacá", type: "holiday" },
  { date: "08/15", nextMonday: true, name: "La Asunción de la Virgen", type: "holiday" },
  { date: "10/12", nextMonday: true, name: "Día de la Raza", type: "holiday" },
  { date: "11/01", nextMonday: true, name: "Todos los Santos", type: "holiday" },
  { date: "11/11", nextMonday: true, name: "Independencia de Cartagena", type: "holiday" },
  { date: "12/08", nextMonday: false, name: "Día de la Inmaculada Concepción", type: "holiday" },
  { date: "12/24", nextMonday: false, name: "Noche navidad", type: "holiday" },
  { date: "12/25", nextMonday: false, name: "Día de Navidad", type: "holiday" },
  { date: "12/31", nextMonday: false, name: "Noche vieja", type: "holiday" },
];

function applyTwoDigits(number) {
  return number < 10 ? "0" + number : number;
}

function getEasterSunday(year) {
  const a = year % 19;
  const b = year % 4;
  const c = year % 7;
  const d = (19 * a + 24) % 30;
  const e = (2 * b + 4 * c + 6 * d + 5) % 7;
  const day = 22 + d + e;
  if (day >= 1 && day <= 31) {
    return new Date(`03/${applyTwoDigits(day)}/${year}`);
  }
  return new Date(`04/${applyTwoDigits(day - 31)}/${year}`);
}

function getNextMonday(date) {
  // console.log("Fecha recibida: " + date.toDateString());
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() + 1);
    // console.log("New date: " + date);
  }
  return date;
}

function getHolidaysByYear(year) {
  const holidaysArray = [];
  const easterSunday = getEasterSunday(year);
  HOLIDAYS.forEach((element) => {
    let date;
    if (!element.daysToSum) {
      date = new Date(element.date + "/" + year);
    } else {
      date = addDaysToDate(easterSunday, element.daysToSum);
    }

    if (element.nextMonday) {
      date = getNextMonday(date);
    }
    holidaysArray.push({
      date: dateToYYYYMMDD(date),
      name: element.name,
    });
  });
  return holidaysArray;
}

function getHolidaysByYearInterval(initialYear, finalYear) {
  const holidaysArray = [];
  // Obtiene el domingo de pascua para calcular los días litúrgicos
  for (let i = initialYear; i <= finalYear; i++) {
    const year = {
      year: i,
      holidays: [],
    };
    const easterSunday = getEasterSunday(i);

    HOLIDAYS.forEach((element) => {
      let date;
      if (!element.daysToSum) {
        date = new Date(element.date + "/" + i);
      } else {
        date = addDaysToDate(easterSunday, element.daysToSum);
      }

      if (element.nextMonday) {
        date = getNextMonday(date);
      }
      year.holidays.push({
        date: dateToYYYYMMDD(date),
        name: element.name,
      });
    });
    holidaysArray.push(year);
  }
  return holidaysArray;
}

function isHoliday(date) {
  return !!getHolidaysByYear(date.getFullYear()).find((holiday) => {
    return holiday.date === dateToYYYYMMDD(date);
  });
}

const workingHours = [
  { day: 1, start: "08:00", end: "12:00" },
  { day: 1, start: "14:00", end: "18:30" },
  { day: 2, start: "08:00", end: "12:00" },
  { day: 2, start: "14:00", end: "18:30" },
  { day: 3, start: "08:00", end: "12:00" },
  { day: 3, start: "14:00", end: "18:30" },
  { day: 4, start: "08:00", end: "12:00" },
  { day: 4, start: "14:00", end: "18:30" },
  { day: 5, start: "08:00", end: "12:00" },
  { day: 5, start: "14:00", end: "18:30" },
  { day: 6, start: "08:00", end: "17:30" },
];

function isWorkingHours(datetime) {
  const day = datetime.getDay(); // Día de la semana (0-6)
  const hour = datetime.toTimeString().slice(0, 5); // Hora en formato HH:MM
  // Filtrar todos los horarios del día correspondiente
  const horariosDelDia = workingHours.filter((horario) => horario.day === day);
  // Verificar si la hora actual está dentro de alguno de los horarios
  return horariosDelDia.some((horario) =>
    hour >= horario.start && hour <= horario.end,
  );
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function diffDays(date1, date2 = new Date()) {
  const diffTime = Math.abs(date1 - date2);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getExpColor(days) {
  if (days >= 30) {
    return "green";
  }
  if (days >= 1) {
    return "yellow";
  }
  return "red";
}

function formatDateHour(date) {
  if(!date) return;
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

export { addTimeToDate, dateIsBefore, dateToLongString, dateToUTC, dateToYYYYMMDD, diffDays, format, formatDate, formatDateHour, getAge, getAnniversary, getDayOfYear, getExpColor, getHolidaysByYearInterval, getWeekDay, isBusinessDay, isWorkingHours, lastBusinessDay, nextBusinessDay, stringDateHourToDate, stringToDate };


