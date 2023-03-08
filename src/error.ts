import { StatusCodes } from 'http-status-codes'

export class AppError extends Error {
  public readonly name: string
  public readonly status: number
  public readonly message: string
  public readonly originalError: unknown | undefined

  constructor(error: { name: string; status: StatusCodes; message: string }, originalError?: unknown) {
    super()
    Object.setPrototypeOf(this, new.target.prototype)

    this.name = error.name
    this.status = error.status
    this.message = error.message
    this.originalError = originalError

    Error.captureStackTrace(this)
  }
}

export const Errors = {
  COMMON: {
    INTERNAL_SERVER_ERROR: {
      name: 'INTERNAL_SERVER_ERROR',
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    },
    COOKIES_NOT_FOUND: {
      name: 'ERR_COMMON_COOKIES_NOT_FOUND',
      status: StatusCodes.NOT_FOUND,
      message: 'Cookies not found',
    },
  },
  AUTH: {
    LOGIN: {
      NO_EMAIL: {
        name: 'ERR_AUTH_LOGIN_NO_EMAIL',
        status: StatusCodes.BAD_REQUEST,
        message: 'Email is required for authentication',
      },
      WRONG_EMAIL_FORMAT: {
        name: 'ERR_AUTH_WRONG_EMAIL_FORMAT',
        status: StatusCodes.BAD_REQUEST,
        message: 'Wrong email format',
      },
      PASSWORD_IS_REQUIRED: {
        name: 'ERR_AUTH_LOGIN_PASSWORD_IS_REQUIRED',
        status: StatusCodes.BAD_REQUEST,
        message: 'Password is required for authentication',
      },
      USER_NOT_FOUND: {
        name: 'ERR_AUTH_LOGIN_USER_NOT_FOUND',
        status: StatusCodes.NOT_FOUND,
        message: 'Wrong user or password',
      },
      CAPTCHA_TOKEN_NOT_FOUND: {
        name: 'ERR_AUTH_LOGIN_CAPTCHA_TOKEN_NOT_FOUND',
        status: StatusCodes.BAD_REQUEST,
        message: 'Captcha token is required for authentication',
      },
      CAPTCHA_WRONG_VERIFY: {
        name: 'ERR_AUTH_LOGIN_CAPTCHA_WRONG_VERIFY',
        status: StatusCodes.BAD_REQUEST,
        message: 'Wrong captcha token',
      },
      USER_IS_DISABLED: {
        name: 'ERR_AUTH_LOGIN_USER_IS_DISABLED',
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Account is disabled',
      },
      WRONG_EMAIL_OR_PASSWORD: {
        name: 'ERR_AUTH_LOGIN_WRONG_EMAIL_OR_PASSWORD',
        status: StatusCodes.NOT_FOUND,
        message: 'Wrong user or password',
      },
    },
    LOGOUT: {
      REFRESHTOKEN_COOKIE_NOT_FOUND: {
        name: 'ERR_AUTH_LOGOUT_REFRESHTOKEN_COOKIE_NOT_FOUND',
        status: StatusCodes.NOT_FOUND,
        message: '"refreshToken" cookie not found',
      },
    },
    REGISTRATION: {
      EMAIL_AND_PASSWORD_ARE_REQUIRED: {
        name: 'ERR_AUTH_REGISTRATION_EMAIL_AND_PASSWORD_ARE_REQUIRED',
        status: StatusCodes.BAD_REQUEST,
        message: 'Email and password are required for registration',
      },
      WRONG_EMAIL_FORMAT: {
        name: 'ERR_AUTH_REGISTRATION_WRONG_EMAIL_FORMAT',
        status: StatusCodes.BAD_REQUEST,
        message: 'Wrong email format',
      },
      WRONG_PASSWORD_LENGTH: {
        name: 'ERR_AUTH_REGISTRATION_WRONG_PASSWORD_LENGTH',
        status: StatusCodes.BAD_REQUEST,
        message: 'Password must be more than 5 characters',
      },
      CAPTCHA_TOKEN_NOT_FOUND: {
        name: 'ERR_AUTH_REGISTRATION_CAPTCHA_TOKEN_NOT_FOUND',
        status: StatusCodes.BAD_REQUEST,
        message: 'Captcha token is required for registration',
      },
      CAPTCHA_WRONG_VERIFY: {
        name: 'ERR_AUTH_REGISTRATION_CAPTCHA_WRONG_VERIFY',
        status: StatusCodes.BAD_REQUEST,
        message: 'Wrong captcha token',
      },
      EMAIL_ALREADY_REGISTERED: {
        name: 'ERR_AUTH_REGISTRATION_EMAIL_ALREADY_REGISTERED',
        status: StatusCodes.BAD_REQUEST,
        message: 'Email already registered',
      },
    },
    REFRESHTOKEN: {
      REFRESHTOKEN_COOKIE_NOT_FOUND: {
        name: 'ERR_AUTH_REFRESHTOKEN_REFRESHTOKEN_COOKIE_NOT_FOUND',
        status: StatusCodes.BAD_REQUEST,
        message: '"refreshToken" cookie not found',
      },
      REFRESHTOKEN_NOT_FOUND: {
        name: 'ERR_AUTH_REFRESHTOKEN_REFRESHTOKEN_NOT_FOUND',
        status: StatusCodes.NOT_FOUND,
        message: 'Refresh token not found',
      },
      TOKEN_EXPIRED: {
        name: 'ERR_AUTH_REFRESHTOKEN_TOKEN_EXPIRED',
        status: StatusCodes.BAD_REQUEST,
        message: 'Refresh token expired',
      },
      USER_NOT_FOUND: {
        name: 'ERR_AUTH_REFRESHTOKEN_USER_NOT_FOUND',
        status: StatusCodes.NOT_FOUND,
        message: 'User not found',
      },
      USER_DISABLED: {
        name: 'ERR_AUTH_REFRESHTOKEN_USER_DISABLED',
        status: StatusCodes.UNAUTHORIZED,
        message: 'User is disabled',
      },
    },
  },
  ITEMS: {
    COMMON: {
      INVALID_ID: {
        name: 'ERR_ITEMS_COMMON_INVALID_ID',
        status: StatusCodes.BAD_REQUEST,
        message: 'Invalid id',
      },
      ITEM_NOT_FOUND: {
        name: 'ERR_ITEMS_COMMON_ITEM_NOT_FOUND',
        status: StatusCodes.NOT_FOUND,
        message: 'Item not found',
      },
    },
    POST_ITEM: {
      LIMIT_REACHED: {
        name: 'ERR_ITEMS_POST_ITEM_LIMIT_REACHED',
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        message: 'Items limit reached',
      },
      UPLOAD_IMAGES: {
        name: 'ERR_ITEMS_POST_ITEM_UPLOAD_IMAGES',
        status: StatusCodes.BAD_REQUEST,
        message: 'Upload images failed',
      },
      ITEM_VALIDATION_ERROR: {
        name: 'ERR_ITEMS_POST_ITEM_VALIDATION_ERROR',
        status: StatusCodes.BAD_REQUEST,
        message: 'Items validation failed',
      },
    },
  },
  PROFILE: {
    GET_PROFILE: {
      PROFILE_NOT_FOUND: {
        name: 'ERR_PROFILE_GET_PROFILE_PROFILE_NOT_FOUND',
        status: StatusCodes.NOT_FOUND,
        message: 'Profile not found',
      },
    },
    DELETE_PROFILE: {
      PROFILE_NOT_FOUND: {
        name: 'ERR_PROFILE_DELETE_PROFILE_PROFILE_NOT_FOUND',
        status: StatusCodes.NOT_FOUND,
        message: 'Profile not found',
      },
    },
    UPDATE_PROFILE: {
      WRONG_EMAIL_FORMAT: {
        name: 'ERR_PROFILE_UPDATE_PROFILE_WRONG_EMAIL_FORMAT',
        status: StatusCodes.BAD_REQUEST,
        message: 'Wrong email format',
      },
      EMAIL_ALREADY_REGISTERED: {
        name: 'ERR_PROFILE_UPDATE_PROFILE_EMAIL_ALREADY_REGISTERED',
        status: StatusCodes.BAD_REQUEST,
        message: 'Email already registered',
      },
    },
  },
  UPLOAD: {
    GET_ITEM_IMAGE: {
      NOT_FOUND: {
        name: 'ERR_UPLOAD_GET_ITEM_IMAGE_NOT_FOUND',
        status: StatusCodes.NOT_FOUND,
        message: 'Item images not found',
      },
    },
    UPLOAD_ITEM_IMAGE: {
      NO_FILES_UPLOADED: {
        name: 'ERR_UPLOAD_UPLOAD_ITEM_IMAGE_NO_FILES_UPLOADED',
        status: StatusCodes.BAD_REQUEST,
        message: 'No files uploaded',
      },
      WRONG_FILE_TYPE: {
        name: 'ERR_UPLOAD_UPLOAD_ITEM_IMAGE_WRONG_FILE_TYPE',
        status: StatusCodes.BAD_REQUEST,
        message: 'Wrong file type',
      },
      FILE_MV: {
        name: 'ERR_UPLOAD_UPLOAD_ITEM_IMAGE_FILE_MV',
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Error on upload file',
      },
    },
  },
}
