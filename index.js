const errorNames = new Set

const createError = (name, formatMsg, assignProps) =>
	(...args) => Object.assign(
		new Error(formatMsg(...args)),
		{ name: (errorNames.add(name), name) },
		assignProps(...args)
	)


export const isError = err => errorNames.has(err.name)

export const UnknownOptionError = createError('UnknownOptionError',
	(opt, long) =>
		`${long ? '' : '-'}${opt}: Unknown ${long ? 'long' : 'short'} option`,
	opt => ({ opt })
)

export const ArgumentRequiredError = createError('ArgumentRequiredError',
	(opt, long) => `${long ? '' : '-'}${opt}: Argument required`,
	opt => ({ opt })
)

export const UnexpectedArgumentError = createError('UnexpectedArgumentError',
	(opt, value) => `${opt}: ${value}: Unexpected argument`,
	(opt, value) => ({ opt, value })
)


export const normalize = (
	argv,
	opts = '',
	longopts = []
) => {
	const res = []
	const optsInfo = new Map

	for (let i = 0; i < opts.length; i++)
		if (opts[i] !== ':')
			optsInfo.set(opts[i], opts[i + 1] === ':')

	for (const opt of longopts) {
		const req = opt.endsWith('=')

		optsInfo.set('--' + (req ? opt.slice(0, -1) : opt), req)
	}

	for (let i = 0; i < argv.length; i++) {
		if (argv[i].startsWith('--')) {
			const [ opt, val ] = argv[i].split('=')

			if (!optsInfo.has(opt))
				throw UnknownOptionError(opt, true)

			if (!optsInfo.get(opt)) {
				if (typeof val === 'string')
					throw UnexpectedArgumentError(opt, val)

				res.push(opt)

				continue
			}

			if (typeof val === 'string') {
				res.push(opt)
				res.push(val)

				continue
			}

			if (i + 1 === argv.length)
				throw ArgumentRequiredError(opt, true)

			res.push(argv[i])
			res.push(argv[i++ + 1])

			continue
		}

		if (argv[i].startsWith('-'))
			for (let j = 1; j < argv[i].length; j++) {
				const opt = argv[i][j]

				if (!optsInfo.has(opt))
					throw UnknownOptionError(opt)

				res.push('-' + opt)

				if (optsInfo.get(opt)) {
					if (j + 1 === argv[i].length) {
						if (i + 1 === argv.length)
							throw ArgumentRequiredError(opt)

						res.push(argv[i++ + 1])

						break
					}

					res.push(argv[i].slice(j + 1))

					break
				}
			}

		else
			res.push(argv[i])
	}

	return res
}

export default normalize
