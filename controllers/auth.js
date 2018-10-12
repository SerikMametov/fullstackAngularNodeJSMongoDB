const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const keys = require('../config/keys')
const errorHandler = require('../utils/errorHandler')

module.exports.login = async function (req, res) {
    const candidate = await User.findOne({email: req.body.email})
    if (candidate) {
        //bcrypt.compareSync - проверим пароль который лежит в таблице в виде hash с паролем который пользователь передал
        const passwordResult = bcrypt.compareSync(req.body.password, candidate.password)
        if (passwordResult) {
            //библиотека jsonwebtoken необходима для генерации токена, метод sign генерируеют этот токен, для чего ему необходимо передать некоторые параметры
            //1 параметр -данные, которые нам в дальнецшем можно будем считать в приложении, это может быть любое данные, например email или userId и т.д.
            //2 параметр - секректное слово
            //3 параметр - время жизни этого токена, как правило в большенстве случаев это 1 час
            // `Bearer ${token}` - позваляет вернуть токен в нужнем для фронтенда виде
            const token = jwt.sign({
                email: candidate.email,
                userId: candidate._id
            }, keys.jwt, {expiresIn: 60 * 60})
            res.status(200).json({
                token: `Bearer ${token}`
            })
        } else {
            res.status(401).json({
                message: 'Пароль не совпал! Поробуйте снова!'
            })
        }
    } else {
        res.status(404).json({
            message: 'Пользователь с таким email не найден!'
        })
    }
}

module.exports.register = async function (req, res) {
    //async function - говорим что данная функция асинхроная, т.е нам надо здесь немного подождать, а именно ждеть потому что нам надо сходить в БД и поискать такой email
    //await - здесь мы не обращаемся к Promis, а точно знаем, что здесь мы подождем пока отработает код User.findOne({email: req.body.email}) и только потом пойдем к коду ниже, далее
    const candidate = await User.findOne({email: req.body.email})
    if (candidate) {
        res.status(409).json({
            message: 'Такой email уже существует! Попробуйте воспользоваться другим email'
        })
    } else {
        //библиотека bcryptjs необходимо что бы пароли хранить в hash, т.е. для защищенности пароля, что бы никто не смог его подглядеть в БД и т.д.
        const salt = bcrypt.genSaltSync(10)
        const password = req.body.password
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(password, salt)
        })

        try {
            await user.save()
            res.status(201).json(user)
        } catch (e) {
            errorHandler(res, e)
        }
    }
}