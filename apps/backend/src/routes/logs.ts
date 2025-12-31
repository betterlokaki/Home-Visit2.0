import { Router } from 'express';
import { LogsController } from '../controllers/logs/LogsController';

const router: Router = Router();
const logsController = new LogsController();

router.post('/', (req, res, next) => {
  logsController.receiveLogs(req, res).catch(next);
});

export default router;


