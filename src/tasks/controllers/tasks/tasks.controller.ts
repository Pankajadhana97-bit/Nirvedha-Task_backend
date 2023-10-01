import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { getCurrentUserId } from 'src/common/decorators';
import { AccessTokenGuard } from 'src/common/guards';
import { TasksService } from 'src/tasks/services/tasks/tasks.service';

@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService) { }

    @UseGuards(AccessTokenGuard)
    @Post('/addtask')
    @HttpCode(HttpStatus.CREATED)
    addTask(@getCurrentUserId() userId: number, @Body('task') work: string) {
        return this.tasksService.addTask(userId, work)
    }


    @UseGuards(AccessTokenGuard)
    @Post('/alltasks')
    @HttpCode(HttpStatus.OK)
    getAllTasks(@getCurrentUserId() userId: number) {
        //console.log(userId)
        return this.tasksService.getAllTasks(userId)
    }

    @UseGuards(AccessTokenGuard)
    @Patch('update/:taskid')
    @HttpCode(HttpStatus.CREATED)
    updateTask(@getCurrentUserId() userId: number, @Param('taskid', ParseIntPipe) taskId: number, @Body('update') updatedTaskData: string) {
        //console.log('here')
        console.log(userId, taskId, updatedTaskData)
        return this.tasksService.updateTask(userId, taskId, updatedTaskData)
    }

    @UseGuards(AccessTokenGuard)
    @Delete('/delete/:taskid')
    @HttpCode(HttpStatus.OK)
    deleteTask(@getCurrentUserId() userId: number, @Param('taskid', ParseIntPipe) taskId: number) {
        //console.log(userId, taskId)
        return this.tasksService.deleteTask(userId, taskId);
    }
}
