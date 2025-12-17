import { Router } from 'express';
import { UsersController } from '../controllers/users/UsersController';
import { UsersService } from '../services/users/UsersService';
import { UserRepository } from '../repositories/users/UserRepository';

const router: Router = Router();
const userRepository = new UserRepository();
const usersService = new UsersService(userRepository);
const usersController = new UsersController(usersService);

router.get('/', (req, res, next) => {
  if (req.query.username) {
    usersController.getUserByUsername(req, res).catch(next);
  } else {
    usersController.getUsersByGroup(req, res).catch(next);
  }
});

export default router;

