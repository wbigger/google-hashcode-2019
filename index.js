var fs = require('fs');
var seedrandom = require('seedrandom');
let rng = seedrandom('0');
let totalScore = 0;

function arrayUnique(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}


//let filenames = ["a_example"];

let filenames = ["a_example",
    "b_lovely_landscapes",
    "c_memorable_moments",
    "d_pet_pictures",
    "e_shiny_selfies"];

function computeInterest(slides) {
    let s1 = null;
    let s2 = null;
    let sum = 0;
    slides.forEach(slide => {
        if (s1 == null) {
            s1 = slide;
            return;
        }
        s2 = slide;
        let i1 = s1.tags.filter(x => s2.tags.includes(x)).length; //intersect(s1.tags,s2.tags).length;
        //console.log(`interest 1: ${i1}`);
        let i2 = s1.tags.filter(x => !s2.tags.includes(x)).length;
        //console.log(`interest 2: ${i2}`);
        let i3 = s2.tags.filter(x => !s1.tags.includes(x)).length;
        //console.log(`interest 3: ${i3}`);
        let min = Math.min(i1, i2, i3);

        sum += min;

        s1 = slide;
        s2 = null;
    });
    //console.log(`sum: ${sum}\n`);
    return sum;
}

filenames.forEach(filename => {
    console.log(filename);
    let maxScore = 0;
    let maxSlides = [];
    [...Array(10).keys()].forEach(element => {
        let contents = fs.readFileSync(`${filename}.txt`, 'ASCII');
        let lines = contents.split('\n');
        lines.shift(); // remove index
        lines.pop(); // remove last empty line
        lines = shuffle(lines);
        //console.log(lines);
        let slides = [];
        let verticalBuffer = null;
        lines.forEach((line, idx) => {
            res = line.split(" ");
            let slide = null;
            if (res[0] == 'H') {
                res.shift(); // remove H
                res.shift(); // remove nTags
                slide = {
                    index: [idx],
                    tags: res
                };
                //console.log(slide.tags);
                slides.push(slide);
            } else if (verticalBuffer == null) {
                res.shift(); // remove V
                res.shift(); // remove nTags
                verticalBuffer = {
                    index: idx,
                    tags: res
                };
            } else {
                res.shift(); // remove V
                res.shift(); // remove nTags
                let tags = arrayUnique(verticalBuffer.tags.concat(res));
                //console.log(tags);
                slide = {
                    index: [idx, verticalBuffer.index],
                    tags: tags
                };
                verticalBuffer = null;
                slides.push(slide);
            }
        });

        let score = computeInterest(slides);
        if (score > maxScore) {
            maxSlides = slides.slice();
            maxScore = score;
        }
    });

    let score = computeInterest(maxSlides);
    console.log(`maxScore: ${score}`);

    totalScore += score;
    let output = `${maxSlides.length}\n`;
    maxSlides.forEach(slide => {
        if (slide.index.length == 1) {
            output += `${slide.index[0]}\n`;
        } else {
            output += `${slide.index[0]} ${slide.index[1]}\n`;
        }
    });


    fs.writeFile(`${filename}_out.txt`, output, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
});

console.log(`Total Score is... ${totalScore}!`);


