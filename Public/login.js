//bootstrap alert
const ShowALertMessage=(alertElement,text,className,display)=>{
    alertElement.innerText = text;
    alertElement.className = className;
    alertElement.style.display = display;
}

const emailRegex = /^[\w!#$%&'*+/=?^`{|}~-]+(?:\.[\w!#$%&'*+/=?^`{|}~-]+)*@(?:[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?\.)+[A-Z]{2,}$/i;


//login 
const email_login = document.getElementById('LoginEmail');
const password_login = document.getElementById('LoginPassword');
const button_login = document.getElementById('loginButton');
const alert_login = document.getElementById('loginAlert');
ShowALertMessage(alert_login,"","","none");

button_login.addEventListener('click',async()=>{
    try{
        if(email_login.value !="" && password_login.value !=""){
            const response = await axios.post('/login',{email:email_login.value,password:password_login.value}); 
            const data = response.data;
            if(data.success === true){
                window.location.href = '/'
            }
            else{
                ShowALertMessage(alert_login,data.error,"alert alert-danger","block")
            }
        }else{
            ShowALertMessage(alert_login,"Email and Password Required.","alert alert-danger","block")
        }
    }catch(e){

    }
})

//register
const username_register = document.getElementById("SignupUsername")
const email_register = document.getElementById("SignupEmail");
const password_register = document.getElementById("SignupPassword");
const password2_register = document.getElementById("SignupPassword2");
const registerButton = document.getElementById("SignupButton");
const alert_register = document.getElementById("signupAlert")

ShowALertMessage(alert_register,"","","none")

username_register.addEventListener('change',async()=>{
    const response = await axios.post('/checkusername',{username:username_register.value});
    const data = response.data;
    if(data.available == false){
        ShowALertMessage(alert_register,"username not available","alert alert-danger","block")
        
    }else{
        ShowALertMessage(alert_register,"username available","alert alert-success","block")
        alert_register.className = "alert alert-success";
        alert_register.innerText = "Username available";
        alert_register.style.display = "block";
    }
})

registerButton.addEventListener('click',async()=>{
    try{
        if(username_register.value !="" && email_register.value!="" && password2_register.value!="" && password_register.value!=""){
            if(emailRegex.test(email_register.value)){
                if(password2_register.value === password_register.value){
                    if((password_register.value).length>=4){
                        const response = await axios.post('/register',{username:username_register.value,email:email_register.value,password:password_register.value});
                        let data = response.data;
                        if(data.success === true){
                            ShowALertMessage(alert_register,"registered successfully!!, please login","alert alert-success","block")
                        }else{
                            ShowALertMessage(alert_register,data.error,"alert alert-success","block")
                        }
                    }else{
                        ShowALertMessage(alert_register,"Password should have minimum 4 chars","alert alert-danger","block")
                    }
                }else{
                    ShowALertMessage(alert_register,"Passwords doesn't match","alert alert-danger","block")
                }
            }else{
                ShowALertMessage(alert_register,"Invalid Email","alert alert-danger","block")
            }
        }else{
            ShowALertMessage(alert_register,"Unfilled Fields","alert alert-danger","block")
        }
    }catch(e){
        console.log(e)
    }

})