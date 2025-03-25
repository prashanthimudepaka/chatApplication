const UserModel = require("./signupSchema");
const methods = {
  signIn: async (request, response) => {
    try {
      const { userName, password } = request.body;
      // response.send({userName,password})      
      // find one this data in DB with or of userName and email
      let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
      let DMQuuary={password, name:userName};
      //if user input email id then search with email, password else name, password
      if(regex.test(userName)){
        DMQuuary= {password, email:userName}
      }
      const findUser = await UserModel.findOne(DMQuuary);
      if (findUser) {
        //if find user then update lastlogin colum
        const userUpdate=await UserModel.updateOne(DMQuuary, { lastlogin: new Date() });
        response.send({ status: 'ok', message: "sucessfully signUp", doc: {name: findUser.name, email: findUser.email} });
      } else {
        response.send({ status: 'fail', message: "UserName/Email does't exits, please signup", body: { userName, password } });
      }
    } catch (e) {
      console.log(e);
      response.send({ status: 'fail', message: e.message });
    }
  },
  signUp: async (request, response) => {
    try {

      const { userName, password, email } = request.body;
      console.log({ userName, password, email })
      //$match: {password, $or: [{ userName }, { email}] }
      // find this data in DB
      const findUser = await UserModel.findOne({ name: userName, email });
      console.log(findUser, 'findUser')
      if (!findUser) {
        const user = await UserModel.create({ name: userName, email, password });
        console.log(user)
        response.send({ status: 'ok', message: "sucessfully signUp" });
      } else {
        response.send({ status: 'fail', message: "That email is already taken, please try another.", body: { userName, password, email } });
      }

    } catch (e) {
      console.log(e);
      response.send({ status: 'fail', message: e.message, body: { userName, password, email } });
    }

  },

  fetchusers: async (req, res) => {
    try {
      const password = req.body.password
      const cpassword = req.body.UserConfirmPassword

      if (password == cpassword) {
        const signedUsers = new signUpsc({
          userName: req.body.userName,
          UserEmail: req.body.UserEmail,
          UserPassword: req.body.UserPassword,
          UserConfirmPassword: req.body.UserConfirmPassword
        })
        signedUsers.save()
        res.redirect('/')

      } else {
        res.send("password is not matching")
      }

    } catch (err) {
      res.status(400).send(err)
    }


  }


}
module.exports = methods;