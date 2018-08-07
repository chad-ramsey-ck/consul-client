import { CoreOptions, RequestResponse } from 'request'
import * as rpn from 'request-promise-native'

import { CatalogRequest, CatalogRequestType } from './types'

import {
    cleanQueryParams,
    deepMerge,
    ensureProtocol,
    headersForRequest,
    removeLeadingTrailingSlash,
} from '../utils'

import { DEFAULT_ADDRESS } from '../constants'

const request = rpn.defaults({
    json: true,
    simple: false,
    resolveWithFullResponse: true,
})

export class ConsulClient {
    private destination: string
    constructor(dest?: string) {
        this.destination =
            dest !== undefined ?
                removeLeadingTrailingSlash(dest) :
                removeLeadingTrailingSlash(DEFAULT_ADDRESS)

        this.destination = ensureProtocol(this.destination)
    }

    public send(req: CatalogRequest, options: CoreOptions = {}): Promise<RequestResponse> {
        switch (req.type) {
            case CatalogRequestType.RegisterEntityRequest:
                return request(
                    deepMerge(options, {
                        uri: `${this.getPathForRequest(req)}/register`,
                        body: req.paylaod,
                        method: 'PUT',
                        headers: headersForRequest(req),
                        qs: cleanQueryParams({
                            dc: req.dc,
                            index: req.index,
                        }),
                    }),
                ).promise()

            case CatalogRequestType.ListNodesRequest:
                return request(
                    deepMerge(options, {
                        uri: `${this.getPathForRequest(req)}/nodes`,
                        method: 'GET',
                        headers: headersForRequest(req),
                        qs: cleanQueryParams({
                            dc: req.dc,
                            index: req.index,
                        }),
                    }),
                ).promise()

            case CatalogRequestType.ListServicesRequest:
                return request(
                    deepMerge(options, {
                        uri: `${this.getPathForRequest(req)}/services`,
                        method: 'GET',
                        headers: headersForRequest(req),
                        qs: cleanQueryParams({
                            dc: req.dc,
                            index: req.index,
                        }),
                    }),
                ).promise()

            case CatalogRequestType.ListServiceNodesRequest:
                return request(
                    deepMerge(options, {
                        uri: `${this.getPathForRequest(req)}/service/${req.serviceName}`,
                        method: 'GET',
                        headers: headersForRequest(req),
                        qs: cleanQueryParams({
                            dc: req.dc,
                            index: req.index,
                        }),
                    }),
                ).promise()

            default:
                const msg: any = req
                return Promise.reject(new Error(`Unsupported request type: ${msg}`))
        }
    }

    private getPathForRequest(req: CatalogRequest): string {
        return `${this.destination}/${req.apiVersion}/${req.section}`
    }
}
