export function collectErrorsMessage(error: { errors: any }) {
  let errors = ''

  for (const key in error.errors) {
    errors += `${error.errors[key].properties.message};`
  }

  errors = errors.slice(0, -1)

  return errors
}
