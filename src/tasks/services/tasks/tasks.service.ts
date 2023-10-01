import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TasksService {
    constructor(private prismaService: PrismaService) { }

    async addTask(userId: number, work: string): Promise<any> {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('user does not exist in the databse')
        }

        const response = await this.prismaService.task.create({
            data: {
                work: work,
                userId: user.id
            }
        })
        return response;
    }

    async getAllTasks(userId: number) {
        const tasks = await this.prismaService.task.findMany({
            where: {
                userId: userId
            }
        })
        return tasks;
    }

    async updateTask(userId: number, taskId: number, updatedTaskData: string): Promise<any> {

        const existingTask = await this.prismaService.task.findUnique({
            where: {
                id: taskId
            }
        })
        if (!existingTask) {
            throw new Error('Task not found')
        }
        if (existingTask.userId !== userId) {
            throw new UnauthorizedException('You do not have the permission to update the task')
        }
        const updateTask = await this.prismaService.task.update({
            where: {
                id: taskId,
            },
            data: {
                work: updatedTaskData
            }
        })
        return updateTask;
    }

    async deleteTask(userId: number, taskId: number) {
        const existingTask = await this.prismaService.task.findUnique({
            where: {
                id: taskId,
            },
        })

        if (!existingTask) {
            throw new NotFoundException('Task not found')
        }
        if (existingTask.userId !== userId) {
            throw new UnauthorizedException('You do not have the permission to delete this')
        }

        //now the showTIme to delete the service
        const deletedTask = await this.prismaService.task.delete({ where: { id: taskId } });
        return deletedTask;
    }



}
