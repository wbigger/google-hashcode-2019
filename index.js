var fs = require('fs');

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

// let filenames = ["a_example"];

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
        let i1 = s1.tags.filter(x => s2.tags.includes(x)).length; // intersection
        //console.log(`interest 1: ${i1}`);
        let i2 = s1.tags.filter(x => !s2.tags.includes(x)).length; // difference
        //console.log(`interest 2: ${i2}`);
        let i3 = s2.tags.filter(x => !s1.tags.includes(x)).length;  // difference
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
    let contents = fs.readFileSync(`${filename}.txt`, 'ASCII');
    let lines = contents.split('\n');
    lines.shift(); // remove index
    lines.pop(); // remove last empty line
    //console.log(lines);
    let slideShow = [];

    // convert lines text to object
    let photos = lines.map((line, idx) => {
        let res = line.split(" ");
        let tags = res.slice(2); // remove orientation and number of tags
        //console.log(tags);
        return {
            index: idx,
            type: res[0],
            nTags: res[1],
            tags: tags
        }
    });

    // horizontal lines
    photos.filter((photo) => {
        return photo.type === 'H';
    }).forEach((photo) => {
        //console.log(photo);
        // push the photo in the slideshow
        let slide = {
            indexArray: [photo.index],
            tags: photo.tags
        };
        slideShow.push(slide);
    });

    // vertical lines
    let vPhotoBuffer = null;
    photos.filter((photo) => {
        return photo.type === 'V';
    }).forEach((photo) => {
        // TODO: put here your logic to join together vertical photos
        if (vPhotoBuffer == null) {
            vPhotoBuffer = photo;
        } else {
            let tags = arrayUnique(vPhotoBuffer.tags.concat(photo.tags));
            let slide = {
                indexArray: [photo.index, vPhotoBuffer.index],
                tags: tags
            };
            slideShow.push(slide);
            vPhotoBuffer = null;
        }
    });

    // TODO: put here your logic to sort slides
    slideShow.sort((s1, s2) => {
        return s1.tags.length > s2.tags.length;
    });

    let score = computeInterest(slideShow);
    console.log(`score: ${score}\n`);
    totalScore += score;
    
    let output = `${slideShow.length}\n`;
    let outputDebug = '';
    slideShow.forEach(slide => {
        if (slide.indexArray.length == 1) {
            output += `${slide.indexArray[0]}\n`;
            outputDebug += `${slide.indexArray[0]} ${slide.tags}\n`;
        } else {
            output += `${slide.indexArray[0]} ${slide.indexArray[1]}\n`;
            outputDebug += `${slide.indexArray[0]} ${slide.indexArray[1]} ${slide.tags}\n`;
        }
    });

    // create file for submission
    fs.writeFile(`${filename}_out.txt`, output, function (err) {
        if (err) throw err;
        console.log(`Saved ${filename}_out.txt!`);
    });

    // create an handy file for debug
    fs.writeFile(`${filename}_debug.txt`, outputDebug, function (err) {
        if (err) throw err;
        console.log(`Saved ${filename}_debug.txt!`);
    });
});

console.log(`--> Total Score is... ${totalScore}! <--\n`);



