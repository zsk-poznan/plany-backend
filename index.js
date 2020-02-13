const custom = require('./custom.json');
const settings = require('./settings.json');
const timetable = require('@wulkanowy/timetable-parser');
const axios = require('axios')
const express = require('express')
const app = express()
const port = 3000
const cheerio = require('cheerio');
baza = {}

app.get('/', (req,res) => {
    axios.get(`${settings.url}/lista.html`).then(response => {
        var $ = cheerio.load(response.data);
        len = $("p > a").length;
        kolejka = 0;
        $("p > a").each(function() {
            kolejka++;
            var link = $(this);
            var href = link.attr("href");
            axios.get(`${settings.url}/${href}`).then(response => {
                    const table = new timetable.Table(response.data);
                    const lessons = table.getDays();
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
                                    if (!baza[f.teacher]) {
                                        baza[f.teacher] = new Array(5);
                                        for (i = 0; i <= 4; i++) {
                                            baza[f.teacher][i] = new Array(10);
                                        }
                                    }
                                    var test = {przedmiot: f.subject, sala: f.room}
                                    baza[f.teacher][day][hour] = test
                            })
                        }
                }
            })
        })
    }).then(() => res.json(baza))
})
axios.get(`${settings.url}/lista.html`).then(response => {
    var $ = cheerio.load(response.data);
    len = $("p > a").length;
    kolejka = 0;
    $("p > a").each(function() {
        kolejka++;
        var link = $(this);
        var href = link.attr("href");
        axios.get(`${settings.url}/${href}`).then(response => {
                const table = new timetable.Table(response.data);
                const lessons = table.getDays();
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
                                if (!baza[f.teacher]) {
                                    baza[f.teacher] = new Array(5);
                                    for (i = 0; i <= 4; i++) {
                                        baza[f.teacher][i] = new Array(10);
                                    }
                                }
                                var test = {przedmiot: f.subject, sala: f.room}
                                baza[f.teacher][day][hour] = test
                        })
                    }
            }
        })
    })
})
app.listen(port)