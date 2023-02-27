import express from 'express'
import session from 'express-session'
import { WorkOS } from '@workos-inc/node'

const app = express()
const router = express.Router()

app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true },
    })
)

const workos = new WorkOS(process.env.WORKOS_API_KEY)
const clientID = process.env.WORKOS_CLIENT_ID
const organizationID = 'org_01GT14QXCWCE3FBA9ZDS0TTJBT';
const redirectURI = process.env.REDIRECT_URI
const state = ''

router.get('/', function (req, res) {
    if (session.isloggedin) {
        res.render('login_successful.ejs', {
            profile: session.profile,
            first_name: session.first_name,
            last_name: session.last_name
        })
    } else {
        res.render('index.ejs', { title: 'Home' })
    }
})

router.get('/login', (req, res) => {
    try {
        const url = workos.sso.getAuthorizationURL({
            organization: organizationID,
            clientID: clientID,
            redirectURI: redirectURI,
            state: state,
        })

        res.redirect(url)
    } catch (error) {
        res.render('error.ejs', { error: error })
    }
})

router.get('/callback', async (req, res) => {
    try {
        const { code } = req.query

        const profile = await workos.sso.getProfileAndToken({
            code,
            clientID,
        })
        const json_profile = JSON.stringify(profile, null, 4)

        session.first_name = profile.profile.first_name
        session.profile = json_profile
        session.last_name = profile.profile.last_name
        session.isloggedin = true

        res.redirect('/')
    } catch (error) {
        res.render('error.ejs', { error: error })
    }
})

router.get('/logout', async (req, res) => {
    try {
        session.first_name = null
        session.profile = null
        session.isloggedin = null
        session.last_name = null

        res.redirect('/')
    } catch (error) {
        res.render('error.ejs', { error: error })
    }
})

export default router
