import dotenv from 'dotenv';
import {mode} from 'server/lib/mode';

dotenv.config({path: './.env.client'});
dotenv.config({path: `./.env.${mode}`});
