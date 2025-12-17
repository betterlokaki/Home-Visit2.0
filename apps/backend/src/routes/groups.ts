import { Router } from 'express';
import { GroupsController } from '../controllers/groups/GroupsController';
import { GroupsService } from '../services/groups/GroupsService';
import { GroupRepository } from '../repositories/groups/GroupRepository';

const router: Router = Router();
const groupRepository = new GroupRepository();
const groupsService = new GroupsService(groupRepository);
const groupsController = new GroupsController(groupsService);

router.get('/', (req, res, next) => {
  groupsController.getAllGroups(req, res).catch(next);
});

export default router;

