const custom = require('./custom.json');
const settings = require('./settings.json');
const timetable = require('@wulkanowy/timetable-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
var out = {}
let promises = [];

if (!fs.existsSync("static")) {
    fs.mkdirSync("static");
}

axios.get(`${settings.url}/lista.html`).then(response => {
    var $ = cheerio.load(response.data);
    var x = $("p > a")
    for (let i = 0; i<x.length; i++) {
        promises.push(axios.get(`${settings.url}/${$(x[i]).attr('href')}`))
    }
}).then(function() {
    axios.all(promises).then(axios.spread((...args) => {
        for (let i = 0; i < args.length; i++) {
            const table = new timetable.Table(args[i].data);
            const lessons = table.getDays();
	    fs.writeFileSync(`./static/${i}.json`, JSON.stringify(lessons));
            for (day = 0; day <= 4; day++) {
                for (hour = 0; hour <= 9; hour++) {
                    if (!lessons[day][hour]) continue
                    lessons[day][hour].forEach(function(f) {
                        if (!f.teacher) {
                            custom.forEach(function(x) {
                            subregex = new RegExp(x.subregex)
                            roomregex = new RegExp(x.roomregex)
                            if (subregex.test(f.subject) && roomregex.test(f.room)) {
                                f.subject = x.subject
                                f.teacher = x.teacher
                            }
                            })
                        }
                        if (!out[f.teacher]) {
                            out[f.teacher] = new Array(5);
                            for (i = 0; i <= 4; i++) {
                                out[f.teacher][i] = new Array(10);
                            }
                        }
                        var test = {przedmiot: f.subject, sala: f.room};
                        out[f.teacher][day][hour] = test;
                    })
                }
            }
        }
    })).then(() => {
        fs.writeFileSync('./static/output.json', JSON.stringify(out))
    })
})
