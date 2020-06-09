import { addNewUser, getUser, getUsers, updateUser, deleteUser, addAdmin, verifyAdmin, login } from '../controllers/users'
import jsonwebtoken from 'jsonwebtoken'
import config from 'config'
import path from 'path'

const JWTSecret = config.get('jwt.secret')

const routes = (app) => {
    app.route('/')
        .get((req, res)=>{
            res.sendFile('index.html', { root: "./public" });
        })
    app.route('/user')
        .get(getUsers)
        .post(addNewUser)
 
    app.route('/user/:id')
        .get(getUser)
        .put(checkTokenAuthentication, updateUser)
        .delete(checkTokenAuthentication, deleteUser)

    app.route('/admin/register')
        .post(addAdmin)
    app.route('/admin/verification/:token')
        .get(verifyAdmin)
    app.route('/admin/login')
        .post(login)
}

function checkTokenAuthentication(req, res, next) {
    var jwttoken = req.body.jwttoken || req.query.jwttoken || req.headers['x-access-token'];
    if(jwttoken){
        jsonwebtoken.verify(jwttoken, JWTSecret, (err, decoded)=>{
            if(err){
                res.send({
                    status: "error",
                    message: "Failed to authenticate token."
                })
            }else{
                next();
            }
        })
    }else{
        res.send({
            status: "error",
            message: "No token provided."
        })
    }

}
 
export default routes