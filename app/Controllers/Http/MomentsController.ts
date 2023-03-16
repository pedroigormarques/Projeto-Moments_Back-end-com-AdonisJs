import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'

import { v4 as uuidv4 } from 'uuid'

import Moment from 'App/Models/Moment'


export default class MomentsController {

    private OpcoesValidacaoImagem = {
        types: ['image'],
        size: '200mb'
    }

    public async index() {
        const moments = await Moment.query().preload("comments");
        return {
            data: moments
        }
    }

    public async show({ params }: HttpContextContract) {
        const moment = await Moment.findOrFail(params.id);
        await moment.load("comments")
        return {
            data: moment
        }
    }

    public async store({ request, response }: HttpContextContract) {

        const body = request.body();

        const image = request.file('image', this.OpcoesValidacaoImagem);

        if (image) {
            const newName = `${uuidv4()}.${image.extname}`
            await image.move(Application.tmpPath('uploads'), { name: newName })
            body.image = newName; //atualizando com o nome correto
        }

        const moment = await Moment.create(body);

        response.status(201);

        console.log(`Novo momento registrado : ${moment}`);

        return {
            message: "Momento criado com sucesso",
            data: moment
        }
    }

    public async update({ params, request }: HttpContextContract) {
        const body = request.body();
        const moment = await Moment.findOrFail(params.id);

        moment.title = body.title;
        moment.description = body.description;

        if (moment.image != body.image || !moment.image) {

            const image = request.file('image', this.OpcoesValidacaoImagem);

            if (image) {
                await image.move(Application.tmpPath('uploads'), {
                    name: moment.image,         //pega o nome anterior para sobrescrever a imagem antiga
                    overwrite: true             //permite sobreescrever a imagem
                });
            }

        }

        await moment.save();

        console.log(`Momento atualizado: ${moment}`);
        return {
            message: "Momento atualizado com sucesso",
            data: moment
        }
    }

    public async destroy({ params }: HttpContextContract) {
        const moment = await Moment.findOrFail(params.id);
        //--- fazer a remoção da imagem referenciada
        await moment.delete();

        console.log(`Momento excluído: ${moment}`);
        return {
            message: "momento excluido com sucesso",
            data: moment
        }
    }

}
