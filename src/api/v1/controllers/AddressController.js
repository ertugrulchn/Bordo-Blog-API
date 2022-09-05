const httpStatus = require('http-status');
const ApiError = require('../responses/error/apiError');
const ApiDataSuccess = require('../responses/success/apiDataSuccess');
const addressService = require('../services/AddressService');
const countryService = require('../services/CountryService');
const cityService = require('../services/CityService');
const districtService = require('../services/DistrictService');
const BaseController = require('./BaseController');
const redisHelper = require('../scripts/utils/redis');

class AddressController extends BaseController {
    constructor() {
        super(addressService);
    }

    getAllCountries = async (req, res, next) => {
        const countries = await countryService.fetchAll();

        if (countries.length > 0) {
            await redisHelper.cache(req, countries);
        }

        ApiDataSuccess.send(
            countries,
            'Countries fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    };

    getAllCitiesByCountryId = async (req, res, next) => {
        const countryId = req.params.countryId;

        const country = await countryService.fetchOneById(countryId);

        if (!country) {
            return next(
                new ApiError('Country not found', httpStatus.NOT_FOUND)
            );
        }

        const cities = await cityService.fetchAll({
            query: { country: countryId },
        });

        const response = {
            country: country,
            cities: cities,
        };

        await redisHelper.cache(req, response);

        ApiDataSuccess.send(
            response,
            'Cities fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    };

    getAllDistrictsByCityId = async (req, res, next) => {
        const cityId = req.params.cityId;

        const city = await cityService.fetchOneById(cityId);

        if (!city) {
            return next(new ApiError('City not found', httpStatus.NOT_FOUND));
        }

        const districts = await districtService.fetchAll({
            query: { city: cityId },
        });

        const response = {
            city: city,
            districts: districts,
        };

        await redisHelper.cache(req, response);

        ApiDataSuccess.send(
            response,
            'Districts fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    };

    getAllMyAddresses = async (req, res, next) => {
        const userId = await req.user._id;

        const addresses = await addressService.fetchAll({
            query: { user: userId },
        });

        ApiDataSuccess.send(
            addresses,
            'User addresses fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    };

    getMyAddress = async (req, res, next) => {
        const userId = await req.user._id;

        const address = await addressService.fetchOneByQuery({
            user: userId,
            _id: req.params.id,
        });

        if (!address) {
            return next(
                new ApiError('Address not found', httpStatus.NOT_FOUND)
            );
        }

        ApiDataSuccess.send(
            address,
            'User address fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    };

    // ! FIXME - Refactor Method
    createMyAddress = async (req, res, next) => {
        req.body.user = req.user._id;
        const countryId = req.body.country;
        const cityId = req.body.city;
        const districtId = req.body.district;

        const countryResult = await countryService.fetchOneById(countryId);

        if (!countryResult) {
            return next(
                new ApiError('Country not found', httpStatus.NOT_FOUND)
            );
        }

        const cityResult = await cityService.fetchOneByQuery({
            _id: cityId,
            country: countryId,
        });

        if (!cityResult) {
            return next(new ApiError('City not found', httpStatus.NOT_FOUND));
        }

        const districtResult = await districtService.fetchOneByQuery({
            _id: districtId,
            country: countryId,
            city: cityId,
        });

        if (!districtResult) {
            return next(
                new ApiError('District not found', httpStatus.NOT_FOUND)
            );
        }

        const response = await addressService.create(req.body);

        if (!response) {
            return next(
                new ApiError(
                    'Address creation failed',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        ApiDataSuccess.send(
            response,
            'Address created successfully',
            httpStatus.CREATED,
            res,
            next
        );
    };

    updateMyAddress = async (req, res, next) => {
        const userId = req.user._id;
        const response = await addressService.updateByQuery(
            { user: userId, _id: req.params.id },
            req.body
        );

        if (!response) {
            return next(
                new ApiError('Address not found', httpStatus.NOT_FOUND)
            );
        }

        ApiDataSuccess.send(
            response,
            'Address updated successfully',
            httpStatus.OK,
            res,
            next
        );
    };

    deleteMyAddress = async (req, res, next) => {
        const userId = req.user._id;
        const response = await addressService.deleteByQuery({
            user: userId,
            _id: req.params.id,
        });

        if (!response) {
            return next(
                new ApiError('Address not found', httpStatus.NOT_FOUND)
            );
        }

        ApiDataSuccess.send(
            response,
            'Address deleted successfully',
            httpStatus.OK,
            res,
            next
        );
    };
}

module.exports = new AddressController();
