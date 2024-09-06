import {app} from './app'
import {SETTINGS} from './settings'
import {connectToDB} from './db/mongo-db';

const start = async () => {
    if (!await connectToDB(SETTINGS.MONGO_URL, SETTINGS.DB_NAME)) {
        console.log('not connect to db')
        process.exit(1)
    }

    app.listen(SETTINGS.PORT, () => {
        console.log('...server started in port ' + SETTINGS.PORT)
    })
}

start()