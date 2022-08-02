const ApiDataSuccess = require('../responses/success/apiDataSuccess');
const ApiError = require('../responses/error/apiError');
const httpStatus = require('http-status');

class BaseController {
    constructor(service) {
        this.service = service;

        this.singleModelName = this.service.model.modelName;
        this.pluralModelName = this.service.model.collection.name;
    }

    fetchAll = async (req, res, next) => {
        const response = await this.service.fetchAll();

        new ApiDataSuccess(response, `${this.pluralModelName} fetched successfully`, httpStatus.OK).place(res);
        return next();
    };

    fetchAllByQuery = async (req, res, next) => {
        const response = await this.service.fetchAll(req.query);

        new ApiDataSuccess(response, `${this.pluralModelName} fetched successfully`, httpStatus.OK).place(res);
        return next();
    };

    fetchOneByQuery = async (req, res, next) => {
        const response = await this.service.fetchOneByQuery(req.query);

        new ApiDataSuccess(response, `${this.singleModelName} fetched successfully`, httpStatus.OK).place(res);
        return next();
    };

    fetchOneByParamsId = async (req, res, next) => {
        const response = await this.service.fetchOneById(req.params.id);

        new ApiDataSuccess(response, `${this.singleModelName} fetched successfully`, httpStatus.OK).place(res);
        return next();
    };

    create = async (req, res, next) => {
        try {
            const response = await this.service.create(req.body);

            if (!response) return next(new ApiError(`${this.singleModelName} creation failed`, httpStatus.BAD_REQUEST));

            new ApiDataSuccess(response, `${this.singleModelName} created successfully`, httpStatus.OK).place(res);
            return next();
        } catch (err) {
            if (err.code === 11000) return next(new ApiError(`${this.singleModelName} already exists`, httpStatus.CONFLICT));
            return next(new ApiError(`${this.singleModelName} creation failed`, httpStatus.BAD_REQUEST));
        }
    };

    updateByQuery = async (req, res, next) => {
        const response = await this.service.updateByQuery(req.query, req.body);

        if (!response) return next(new ApiError(`${this.singleModelName} update failed`, httpStatus.BAD_REQUEST));

        new ApiDataSuccess(response, `${this.singleModelName} updated successfully`, httpStatus.OK).place(res);
        return next();
    };

    updateByParamsId = async (req, res, next) => {
        const response = await this.service.updateById(req.params.id, req.body);

        if (!response) return next(new ApiError(`${this.singleModelName} update failed`, httpStatus.BAD_REQUEST));

        new ApiDataSuccess(response, `${this.singleModelName} updated successfully`, httpStatus.OK).place(res);
        return next();
    };

    deleteByQuery = async (req, res, next) => {
        const response = await this.service.deleteByQuery(req.query);

        if (!response) return next(new ApiError(`${this.singleModelName} deletion failed`, httpStatus.BAD_REQUEST));

        new ApiDataSuccess(response, `${this.singleModelName} deleted successfully`, httpStatus.OK).place(res);
        return next();
    };

    deleteByParamsId = async (req, res, next) => {
        const response = await this.service.deleteById(req.params.id);

        if (!response) return next(new ApiError(`${this.singleModelName} deletion failed`, httpStatus.BAD_REQUEST));

        new ApiDataSuccess(response, `${this.singleModelName} deleted successfully`, httpStatus.OK).place(res);
        return next();
    };
}

module.exports = BaseController;