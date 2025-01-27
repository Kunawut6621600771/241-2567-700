let students=[
    {
    Name:'John',
    score:75,
    grade :'a'
    },
    {
    Name:'Jane',
    score:75,
    grade :'b'
    },
    {
    Name:'Doe',
    score:60,
    grade :'c'
    }
]
let student = students.find((s)=>0{
    if (s.Name === 'John'){
        return true;
    }
})
let doubleScore_student = students.map((s)=>{
    s.score = s,score * 2
})
let hightscore_student = students.filter((s)=>{
    if (s.score > 80){
        return true;

    }