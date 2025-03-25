const sign_in_btn = document.querySelector("#sign-in-btn")
const sign_up_btn = document.querySelector("#sign-up-btn")
const container = document.querySelector(".container")
sign_up_btn.addEventListener('click', () => {
    container.classList.add("sign-up-mode")

})
sign_in_btn.addEventListener('click', () => {
    container.classList.remove("sign-up-mode")

})

$(document).ready(function () {


    $('#signInForm').validate({ // initialize the plugin
        highlight: function (elememt) {
            $(elememt).parent().addClass("filed-error")
        },
        unhighlight: function (elememt) {
            $(elememt).parent().removeClass("filed-error")
        },
        rules: {
            name: {
                required: true
            },
            password: {
                required: true,
                minlength: 5
            }
        }
    });
    $('#signUpForm').validate({ // initialize the plugin
        highlight: function (elememt) {
            $(elememt).parent().addClass("filed-error")
        },
        unhighlight: function (elememt) {
            $(elememt).parent().removeClass("filed-error")
        },
        rules: {
            UserEmail: {
                required: true,
                email: true
            },
            UserPassword: {
                required: true,
                minlength: 5
            },
            UserConfirmPassword: {
                required: true,
                minlength: 5
            },
            UserEmail: {
                required: true,
                email: true
            }
        }
    });

    $("#signUpFormBtn").click(function () {
        const isVaid = $('#signUpForm').valid();

        if (isVaid) {
            //reading values from input
            const userName = document.querySelector('[name="Username"]').value;
            const password = document.querySelector('[name="UserPassword"]').value;
            const email = document.querySelector('[name="UserEmail"]').value;
            const reqBody = { "userName":userName, "password":password, "email":email };
            $.ajax({
                type: "POST", //rest Type
                url: "/api/signup",
                async: true,
                data: JSON.stringify(reqBody),
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    const { status, message, url } = response
                    if (status == "ok") {
                        alert("Thank you for filling out our sign up form. We are glad that you joined us. click on sign to login");
                        // window.location.href = "/";
                    }
                    else if (status === 'fail' && message) {
                        alert(message + "or Please click on 'Sign In' to login");
                    } else {
                        console.log(response);
                        
                    }
                },
            });
        } else {
            alert("Please fill form");
        }

    })
    $("#signInFormBtn").click(function () {
        const isVaid = $('#signInForm').valid()
        if (isVaid) {
            const userName = document.querySelector('[name="name"]').value;
            const password = document.querySelector('[name="password"]').value;
            const reqBody = { "userName": userName, "password": password };
            $.ajax({
                type: "POST", //rest Type
                url: "/api/signIn",
                async: true,
                data: JSON.stringify(reqBody),
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    const { status, message, doc } = response
                    if (status == "ok") {
                        console.log(doc)
                        localStorage.setItem('user', JSON.stringify(doc));
                        window.location.href = "/";
                    }
                    else if (status === 'Fail' && message) {
                        alert(message + "or Please click on 'Sign In' to login");
                    } else {
                        console.log(response);
                    }
                },
            });
        } else {
            alert("Please fill form");
        }
    })



});