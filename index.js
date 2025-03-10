const baseurl = 'http://localhost:8000';
let mode ='CREATE'//defualt mode
let selectedID = ''

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log('id',id);
    if (id){
        mode = 'EDIT'
        selectedID = id
        //1.เราจะดึงข้อมูลของ user คนนั้นออกมา
        try{
            const response = await axios.get(`${baseurl}/users/${id}`);
            console.log('response',response.data);
            const user = response.data;
            //2.นำข้อมูลที่ดึงออกมาไปแสดงใน input form
            let firstNameDOM = document.querySelector('input[name = firstname]')
            let lastNameDOM = document.querySelector('input[name =lastname]');
            let ageDOM = document.querySelector('input[name =age]');
            let descriptionDOM = document.querySelector('textarea[name=description]');
            firstNameDOM.value = user.firstname;
            lastNameDOM.value = user.lastname;
            ageDOM.value = user.age;
            descriptionDOM.value = user.description;

        let genderDOMs = document.querySelectorAll('input[name= gender]') ;
        let interestDOM = document.querySelectorAll('input[name=interest]') ; 
        for (let i=0; i<genderDOMs.length; i++){
            if (genderDOMs[i].value == user.gender){
                genderDOMs[i].checked = true;
            }
        }
        
        console.log('interest',user.interest);
        for (let i=0; i<interestDOM.length; i++){
            if (user.interest.includes(interestDOM[i].value)){
                // includes = ตรวจสอบว่ามีค่านี้อยู่ใน array หรือไม่ ถ้ามี return true ถ้าไม่มี return false
                interestDOM[i].checked = true;
            }
        }
        
            
        }catch(error){
            console.error('error:',error);
        }
        
    }
}
const validateData = (userData) => {
    let errors =[]

    if (!userData.firstname){
        errors.push('กรุณากรอกชื่อ');
    }
    if (!userData.lastname){
        errors.push('กรุณากรอกนามสกุล');
    }
    if (!userData.age){
        errors.push('กรุณากรอกอายุ');
    }
    if (!userData.gender){
        errors.push('กรุณาเลือกเพศ');
    }
    if (!userData.interest){
        errors.push('กรุณาเลือกความสนใจ');
    }
    if (!userData.description){
        errors.push('กรุณากรอกข้อมูล');
    }
    return errors;
} // data validation

 
const submitData = async () => {
    let firstNameDOM = document.querySelector('input[name = firstname]')
    let lastNameDOM = document.querySelector('input[name =lastname]');
    let ageDOM = document.querySelector('input[name =age]');
    let genderDOM = document.querySelector('input[name= gender]:checked') || {};
    let interestDOM = document.querySelectorAll('input[name=interest]:checked') || {}; //null = อ่านค่าไม่ได้ error {} = ไม่มีค่ายังอ่านได้
    let descriptionDOM = document.querySelector('textarea[name=description]');

    let messageDOM = document.getElementById('message');

    try{
    let interest='';
    for(let i=0; i<interestDOM.length; i++){
        interest += interestDOM[i].value;
        if (i !=interestDOM.length-1){
            interest += ',';
        }
    }

    let userData = {
        firstname: firstNameDOM.value,
        lastname: lastNameDOM.value,
        age: ageDOM.value,
        gender: genderDOM.value,
        description: descriptionDOM.value,
        interest: interest,
        
    }

    console.log('submit data',userData);
/*
        const errors = validateData(userData);
        if (errors.length > 0)//มี errorเกิดขึ้นกี่ตำแหน่ง
        {
            throw{
                message:'กรุณากรอกข้อมูลให้ครบถ้วน',
                errors: errors
            }
        }
            */
        let message = 'บันทึกข้อมูลเรียบร้อยแล้ว'
        if (mode == 'CREATE'){
        const response =  await axios.post(`${baseurl}/users`,userData)
        console.log('response',response.data);
        }else{
            const response =  await axios.put(`${baseurl}/users/${selectedID}`,userData)
            message = 'แก้ไขข้อมูลเรียบร้อยแล้ว'
            console.log('response',response.data);
            window.location.href = "user.html";
        }
        messageDOM.innerText = message
        messageDOM.className = 'message success';
    }catch(error){
        console.log('error message',error.message);
        console.log('error',error.errors);

        if (error.response){
            console.log(error.response);
            error.message = error.response.data.message;
            error.errors = error.response.data.errors;
        }  

        let htmlData = '<div>'
        htmlData += `<div>${error.message}</div>`
        htmlData += '<ul>'
        for (let i=0; i<error.errors.length; i++){
                htmlData += `<li> ${error.errors[i]} </li>`
            }
        htmlData += '</ul>'
        htmlData += '</div>'
         messageDOM.innerHTML = htmlData
         messageDOM.className = 'message danger'
    }   

}