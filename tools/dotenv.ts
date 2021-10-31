import dotenv from 'dotenv';
import {mode} from 'tools/mode';

dotenv.config({path: `./.env.${mode}`});
