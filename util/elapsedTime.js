export function ellapsedTime(date1) {
    /*
     * calcDate() : Calculates the difference between two dates
     * @date1 : "First Date in the format M-D-Y"
     * @date2 : "Second Date in the format M-D-Y"
     * return : Array
     */
    //Initiate date object
    // const dt_date1 = new Date(date1)
    const currentDate = new Date();
    const startDate = new Date(date1);
    //Get the Timestamp
    var stateTime = startDate.getTime();
    var currentTime = currentDate.getTime();

    let calc;
    //Check which timestamp is greater
    if (stateTime > currentTime) {
        calc = new Date(stateTime - currentTime);
    } else {
        calc = new Date(currentTime - stateTime);
    }
    //Retrieve the date, month and year
    var calcFormatTmp =
        calc.getDate() + "-" + (calc.getMonth() + 1) + "-" + calc.getFullYear();
    //Convert to an array and store
    var calcFormat = calcFormatTmp.split("-");
    //Subtract each member of our array from the default date
    var days_passed = parseInt(Math.abs(calcFormat[0]) - 1);
    var months_passed = parseInt(Math.abs(calcFormat[1]) - 1);
    var years_passed = parseInt(Math.abs(calcFormat[2] - 1970));

    //Set up custom text
    const yrsTxt = ["year", "years"];
    const mnthsTxt = ["month", "months"];
    const daysTxt = ["day", "days"];

    //Convert to days and sum together
    var total_days = years_passed * 365 + months_passed * 30.417 + days_passed;

    //display result with custom text
    const result =
        (years_passed == 1
            ? years_passed + " " + yrsTxt[0] + " "
            : years_passed > 1
            ? years_passed + " " + yrsTxt[1] + " "
            : "") +
        (months_passed == 1
            ? months_passed + " " + mnthsTxt[0]
            : months_passed > 1
            ? months_passed + " " + mnthsTxt[1] + " "
            : "") +
        (days_passed == 1
            ? days_passed + " " + daysTxt[0]
            : days_passed > 1
            ? days_passed + " " + daysTxt[1]
            : "");

    return result;
}
