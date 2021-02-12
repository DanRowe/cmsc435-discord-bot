import { promises as fs } from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'
import { cutAtWord, parseTableData } from '../parse'
import config from '../config'
import { ExecuteWebhookBody } from '../types/interface'
import { Embed } from '../types/embed'

/**
 * =============================================================================
 * @see cutAtWord
 */
describe('cutAtWord()', () => {

    let actual: string
    const paragraph = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    const maxLen = 30

    beforeAll(() => {
        actual = cutAtWord(paragraph, maxLen)
        // We should be testing a paragraph that should be trimmed. Otherwise
        // below cases are trivial.
        expect(paragraph.length).toBeGreaterThan(maxLen)
    })

    describe('Simple functionality', () => {

        it('Returns a string', () => {
            expect(typeof actual).toBe('string')
        })

        it('Trims paragraphs longer than the max length', () => {
            expect(actual.length).toBeLessThanOrEqual(maxLen)
        })

        it('Starts trimming at the beginning of the paragraph', () => {
            const firstWord: string = paragraph.split(/\s/g)[0]
            expect(actual.startsWith(firstWord)).toBeTruthy()
        })

        it('Does not split the paragraph within a word', () => {
            expect(actual).toBe('Lorem ipsum dolor sit amet,')
        })

        it('Does not cut when the paragraph is shorter than the max length', () => {
            expect(cutAtWord(paragraph, paragraph.length)).toBe(paragraph)
        })
    })

    describe('edge cases', () => {
        const hw = 'Hello, world!  ' // the trailing space is important
        const ex1 = 'some big fancy sentence'

        it.each([

            [ hw, hw.length, hw ],                // Not shorter than constraint; not modified
            [ hw, hw.length - 1, hw.trimEnd() ],  // Shorter, should trim
            [ hw, hw.length - 2, hw.trimEnd() ],  // ^
            [ 'What a feelin', 6, 'What a' ],
            [ 'big          spaces', 8, 'big' ],
            [ ex1, 8, 'some big' ],
            [ ex1, 10, 'some big' ],
            [ ex1, 12, 'some big' ],
            [ ex1, 13, 'some big fancy' ],
        ])('Splitting "%s" with len %d results in "%s"',
            (str: string, len: number, expected: string) => {

                expect(cutAtWord(str, len)).toBe(expected)
            })

    })

})

/**
 * =============================================================================
 * @see parseTableData
 */
describe('parseTableData()', () => {
    // let small: HTMLTableCellElement, large: HTMLTableCellElement
    let blogpost: Document
    let large: HTMLTableCellElement, small: HTMLTableCellElement
    const filename = './data/blog-2021-02-11.html'


    beforeAll(async () => {
        blogpost = await fs.readFile(
            path.resolve(__dirname, filename),
            'utf-8'
        ).then(html => new JSDOM(html).window.document)

        const cells: HTMLTableCellElement[] = Array.from(blogpost.querySelectorAll('tr td'))

        small = cells[1]
        large = cells[10]
    })

    describe('Root structure of both long and short posts', () => {
        let smallActual: ExecuteWebhookBody
        let largeActual: ExecuteWebhookBody

        beforeAll(() => {
            smallActual = parseTableData(small)
            largeActual = parseTableData(large)
        })
        it('Includes the configured avatar', () => {
            expect(smallActual.avatar_url).toBe(config.avatarUrl)
            expect(largeActual.avatar_url).toBe(config.avatarUrl)
        })

        it('Includes the configured username', () => {
            expect(smallActual.username).toBe(config.username)
            expect(largeActual.username).toBe(config.username)
        })

        it('Contains an array of embeds', () => {
            [ smallActual.embeds, largeActual.embeds ].forEach(embeds => {
                expect(embeds).toBeDefined()
                expect(embeds).toBeInstanceOf(Array)
            })
        })
    })

    describe('Small blog post embeds', () => {

        let actual: Embed[]

        beforeAll(() => {
            actual = parseTableData(small).embeds!
        })

        it('Should be defined', () => {
            expect(actual).toBeDefined()
        })

        it('Should contain a single embed', () => {
            expect(actual).toHaveLength(1)
        })

        it('Description should be blog post text', () => {

            const expectedDesc = '**2021-02-11** Today we conclude our discussion of the principles, ' +
            'recognizing that our mission through the balance of the semester is to look ' +
            'for ways to apply them in the class project, then assess what are their effects.'

            expect(actual[0].description).toBe(expectedDesc)
        })

        it('Should not have a footer', () => {
            expect(actual[0].footer).toBeUndefined()
        })

        it('Uses the anchor ID as the title', () => {
            expect(actual[0].title).toBe('2021-02-11')
        })
    })

    describe('Large post embeds', () => {
        let actual: Embed[]

        beforeAll(() => {
            actual = parseTableData(large).embeds!
        })

        it('Should be defined', () => {
            expect(actual).toBeDefined()
        })

        it('Should contain multiple embeds', () => {
            expect(actual.length).toBeGreaterThan(1)
        })

        it('First embed should have a title', () => {
            const { title } = actual[0]
            expect(title).toBe('2021-01-27')
        })

        it('Every other embed should not have a title', () => {
            const [ first, ...rest ] = actual
            for (const embed of rest) {
                expect(embed.title).toBeUndefined()
            }
        })

        it('Each embed contains a footer containing the part number', () => {
            let i = 1

            for (const { footer } of actual) {
                expect(footer).toBeDefined()
                expect(typeof footer?.text).toBe('string')
                expect(footer?.text.includes(`${i}`))

                i++
            }
        })

        it('Descriptons should be shorter than 2000 characters', () => {
            for (const embed of actual) {
                expect(embed.description?.length).toBeLessThanOrEqual(2000)
            }
        })

    })
})
