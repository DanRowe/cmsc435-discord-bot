import axios, { AxiosResponse } from 'axios'
import validator from 'validator'
import config from '../config'

const { isURL } = validator

describe('config', () => {

    /**
     * blogUrl
     */
    describe('blogUrl', () => {
        it('is a url', () => {
            expect(isURL(config.blogUrl)).toBeTruthy()
        })

        describe('The resource the url points to', () => {
            let res: AxiosResponse<any>

            beforeAll(async () => {
                res = await axios(config.blogUrl)
            })

            it('returns with a successful status code', () => {
                expect(res.status).toBeGreaterThanOrEqual(200)
                expect(res.status).toBeLessThanOrEqual(299)
            })

            it('has a body', () => {
                const contentLength: unknown = res.headers?.['content-length']

                expect(res.data).toBeDefined()
                expect(JSON.stringify(res.data).length).toBeGreaterThan(0)
                expect(contentLength).toBeDefined()
                expect(Number.parseInt(contentLength as any)).toBeGreaterThan(0)
            })

            it('Points to an html page', () => {
                const contentType: unknown = res.headers?.['content-type']

                expect(contentType).toBeTruthy()
                expect(typeof contentType).toBe('string')
                expect(contentType).toMatch(/html/)
            })
        })

    })

    /**
     * webhookUrl
     */
    describe('webhookUrl', () => {
        const { webhookUrl } = config
        let OLD_ENV: typeof process.env

        beforeAll(() => {
            OLD_ENV = process.env
        })

        afterEach(() => {
            process.env = OLD_ENV
        })

        it('is a url', () => {
            expect(isURL(webhookUrl)).toBeTruthy()
        })

        it('points to discord', () => {
            expect(webhookUrl).toMatch(/discord/)
        })

        it('is set by process.env.WEBHOOK_URL', () => {
            expect(webhookUrl).toBe(process.env.WEBHOOK_URL)
        })

        xit('throws if WEBHOOK_URL is not defined', () => {

            jest.isolateModules(() => {
                jest.mock('dotenv')
                delete process.env.WEBHOOK_URL
                expect(() => import('../config')).toThrow()
            })
        })
    })

    /**
     * blogFile
     */
    describe ('blogFile', () => {
        it('is a file path', () => {
            expect(typeof config.blogFile).toBe('string')
        })
    })

    /**
     * avatarUrl
     */
    describe('avatarUrl', () => {
        const { avatarUrl } = config

        it('is a url', () => {
            expect(isURL(avatarUrl)).toBeTruthy()
        })

        describe('the linked resource', () => {
            let res: AxiosResponse

            beforeAll(async () => {
                res = await axios(avatarUrl)
            })

            it('Returns with a successful status code', () => {
                expect(res.status).toBeGreaterThanOrEqual(200)
                expect(res.status).toBeLessThanOrEqual(299)
            })

            it('Points to an image', () => {
                const contentType: unknown = res.headers?.['content-type']

                expect(contentType).toBeTruthy()
                expect(typeof contentType).toBe('string')
                expect(contentType).toMatch(/image/)
            })

            it('has a body', () => {
                const contentLength: unknown = res.headers?.['content-length']

                expect(res.data).toBeDefined()
                expect(JSON.stringify(res.data).length).toBeGreaterThan(0)
                expect(contentLength).toBeDefined()
                expect(Number.parseInt(contentLength as any)).toBeGreaterThan(0)
            })
        })
    })

    /**
     * username
     */
    describe('username', () => {
        it('is a string', () => {
            expect(typeof config.username).toBe('string')
        })
    })

    /**
     * maxDescLen
     */
    describe('maxDescLen', () => {
        const { maxDescLen } = config

        it('is a number', () => {
            expect(typeof maxDescLen).toBe('number')
            expect(isNaN(maxDescLen)).toBeFalsy()
        })

        it('is nonzero and positive', () => {
            expect(maxDescLen).toBeGreaterThan(0)
        })
    })
})
