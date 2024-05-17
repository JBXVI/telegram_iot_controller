const sendToken = document.getElementById("sendToken");
const emailAlert = document.getElementById("emailAlert");

//bootstrap alert
const ShowALertMessage=(alertElement,text,className,display)=>{
    alertElement.innerText = text;
    alertElement.className = className;
    alertElement.style.display = display;
}

ShowALertMessage(emailAlert,"","","none")

sendToken.addEventListener('click',async()=>{
    const response = await axios.post('/generateToken',{});
    let data = response.data;
    if(data.success === true){
        ShowALertMessage(emailAlert,"token have been sent to your email","alert alert-success","block")
    }else{
        if(data.error){
            ShowALertMessage(emailAlert,data.error,"alert alert-danger","block")
        }else{
            ShowALertMessage(emailAlert,"unknown error, please try again later","alert alert-danger","block")
        }
    }
})