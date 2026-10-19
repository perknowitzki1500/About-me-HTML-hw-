const form =document("contact-form");

const nameInput =document.getElementById("name");
const emailInput =document.getElementById("email");
const phoneInput =document.getElementById("phone");
const ageInput =document.getElementById("age");
const priorityInput =document.getElementById("priority");
const messageInput =document.getElementById("message");

const summary = document.getElementbyId("summary");


function validateName() {
    const error = document.getElementById("name-error");

    if (nameInput.value.trim().length < 2) {
        error.textContent = "Name must be at least 2 letters"
        return false;
    }

    error.textContent = "Valid";
    return true;
}

function validateEmail() {
    const error = document.getElementById("email-error");
    const email = emailInput.value.trim();

    if (!email.includes("@") || !email.includes(".")) {
        error.textContent = "Enter a valid email.";
        return false;
    }
}

    error.textContent = "Valid";
    return true;

    function validatePhone() {
        const error = document.getElementById("phone-error");
        const phone = phoneInput.value.replace(/\D/g, "");

    
        if (phone.length !== 10) {
            error.textContent = "Phone must have 10 digits";
            return false;
        }
    
        error.textContent = "Valid";
        return true;
    }
    

    


        function validateAge() {
            const error = document.getElementById("age-error");
            
    
        
            if (Number(ageInput.value) < 18) {
                error.textContent = "You must be at least 18";
                return false;
            }  
        }
        
            error.textContent = "Valid";
            return true;


            function validatePriority() {
                const error = document.getElementById("priority-error");
                const priority = Number(priorityInput.value);
        
            
                if (priority < 1 || priority > 5) {
                    error.textContent = "Priority must be between 1 and 5";
                    return false;
                }
            }
            
                error.textContent = "Valid";
                return true;


                function validateMessage() {
                    const error = document.getElementById("message-error");
            
                
                    if (messageInput.value.trim().length < 10) {
                        error.textContent = "Message must be atleast 10 characters";
                        return false;
                    }
                
                    error.textContent = "Valid";
                    return true;

                }


                form.addEventListener("submit", function(event) {
                    event.preventDefault();

                    const nameVaild =validateName();
                    const emailVaild =validateEmail();
                    const phoneVaild =validatePhone();
                    const AgeVaild =validateAge();
                    const priorityValid =validName(); 
                    const messageVaild =validMessage();

                    if(
                        nameVaild &&
                        emailValid &&
                        phoneValild &&
                        ageValid &&
                        priorityValid &&
                        messageVlaid 
                    ) {
                        showSummary();
                    }

                });

                    function showSummary() {

                        summary.innerHTML = `
                            <h3>Contact Information</h3>
                            <p><strong>Name:</strong> ${nameInput.value}</p>
                            <p><strong>Email:</strong> ${emailInput.value}</p>
                            <p><strong>Phone:</strong> ${phoneInput.value}</p>
                            <p><strong>Age:</strong> ${ageInput.value}</p>
                            <p><strong>Priority:</strong> ${priorityInput.value}</p>
                            <p><strong>Message:</strong> ${messageInput.value}</p>
                        `;
                    }

                    async function getAdvice() {
                        const apiResult =document.getElementById("api-result");
                        
                        apiResult.textContent ="Loading advice...";

                        try {
                            const response = await fetch("https://api.adviceslip.com/advice");

                            if (!response.ok) {
                                throw new Error("Api request failed")
                            }

                            const data = await response.json();

                            apiResult.textContent = data.slip.advice;
                        } catch (error) { 
                            apiResult.textContent = 
                            "Sorry, advice is not availble right now"
                        }
                    }
                    getAdvice();
                   

                

        

