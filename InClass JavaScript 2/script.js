const weights = {
test1: 0.25,
test2: 0.30,
p1: 0.01,
p2: 0.04,
p3: 0.15,
assign: 0.25
};


function toNum(id){
const el=document.getElementById(id);
const v=el.value.trim();
if(v==='') return NaN;
return Number(v);
}


function clampAndValidate(v){
return !(Number.isNaN(v) || v < 0 || v > 100);
}


function getLetter(percent){
if(percent >= 94) return 'A';
if(percent >= 90) return 'A-';
if(percent >= 87) return 'B+';
if(percent >= 84) return 'B';
if(percent >= 80) return 'B-';
if(percent >= 77) return 'C+';
if(percent >= 74) return 'C';
if(percent >= 70) return 'C-';
if(percent >= 67) return 'D+';
if(percent >= 64) return 'D';
if(percent >= 60) return 'D-';
return 'F';
}


function letterToGPA(letter){
switch(letter){
case 'A': return 4.0;
case 'A-': return 3.7;
case 'B+': return 3.3;
case 'B': return 3.0;
case 'B-': return 2.7;
case 'C+': return 2.3;
case 'C': return 2.0;
case 'C-': return 1.7;
case 'D+': return 1.3;
case 'D': return 1.0;
case 'D-': return 0.7;
default: return 0.0;
}
}


document.getElementById('calcBtn').addEventListener('click', ()=>{
const name = document.getElementById('studentName').value.trim() || 'Student';
const ids = ['test1','test2','p1','p2','p3','assign'];
const values = ids.map(toNum);


let allValid = true;
ids.forEach((id,i)=>{
const el = document.getElementById(id);
if(!clampAndValidate(values[i])){
el.style.borderColor = '#f87171';
allValid = false;
} else {
el.style.borderColor = '';
}
});


if(!allValid){
alert('Please enter valid numeric scores between 0 and 100 for all fields.');
return;
}


const [t1,t2,p1,p2,p3,assign] = values;
const finalPercent = t1*weights.test1 + t2*weights.test2 + p1*weights.p1 + p2*weights.p2 + p3*weights.p3 + assign*weights.assign;
const rounded = Math.round(finalPercent*10)/10;
const letter = getLetter(rounded);
const gpa = letterToGPA(letter);


document.getElementById('outName').textContent = name + ' — Final Grade';
document.getElementById('percentOut').textContent = rounded.toFixed(1) + '%';
document.getElementById('letterOut').textContent = letter;
document.getElementById('gpaOut').textContent = gpa.toFixed(2);
document.getElementById('result').style.display = 'block';
});


document.getElementById('resetBtn').addEventListener('click', ()=>{
document.getElementById('gradeForm').reset();
document.getElementById('result').style.display = 'none';
['test1','test2','p1','p2','p3','assign'].forEach(id=>document.getElementById(id).style.borderColor='');
});