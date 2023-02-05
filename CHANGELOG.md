# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.0.0-alpha.5](https://github.com/rudnovd/laundry-labels-app-api/compare/v0.0.0-alpha.4...v0.0.0-alpha.5) (2023-02-05)


### Features

* add available item icons constant ([1e49bbd](https://github.com/rudnovd/laundry-labels-app-api/commit/1e49bbda83bb40e5c3157271cdb0be6382c63d1a))
* **models:** add new validators for item model ([05f209f](https://github.com/rudnovd/laundry-labels-app-api/commit/05f209f3debdffeaf58c7740f75d72150183566e))
* **models:** add options in user schema ([3b5b62a](https://github.com/rudnovd/laundry-labels-app-api/commit/3b5b62a3102011231a1c5a27b0b68680cb69c1d9))


### Bug Fixes

* **items:** images url parsing ([ba6ad05](https://github.com/rudnovd/laundry-labels-app-api/commit/ba6ad05155e08fd88d6f0ec56962a28cf8c9a94d))

## [0.0.0-alpha.4](https://github.com/rudnovd/laundry-labels-app-api/compare/v0.0.0-alpha.3...v0.0.0-alpha.4) (2023-01-28)


### Bug Fixes

* **items:** return editItem result after updating model ([e49366b](https://github.com/rudnovd/laundry-labels-app-api/commit/e49366b7e0bdffd8b81378352e10db87f61addd3))
* **router:** handle wrong routes ([05eddc9](https://github.com/rudnovd/laundry-labels-app-api/commit/05eddc94e468dae84cb355af3b55c2faf6743948))

## [0.0.0-alpha.3](https://github.com/rudnovd/laundry-labels-app-api/compare/v0.0.0-alpha.2...v0.0.0-alpha.3) (2023-01-22)


### Features

* **api:** add name field in Item schema ([03cf1c0](https://github.com/rudnovd/laundry-labels-app-api/commit/03cf1c07e0405f681c63ec23534152561a54e36a))
* **api:** add profile api ([d38cc7b](https://github.com/rudnovd/laundry-labels-app-api/commit/d38cc7bb91bd506ecfa67fe4bc3f9ad60801f1d0))
* **cloudinary:** upload image to cloudinary from buffer ([93258e9](https://github.com/rudnovd/laundry-labels-app-api/commit/93258e9423165b46fc4bed4ca7ef837a6fde1802))
* **config:** add env values for upload path and logs path ([62f388d](https://github.com/rudnovd/laundry-labels-app-api/commit/62f388d72aa839bb2dcd887526ce692251e3d350))
* **error:** add new errors objects ([560bb62](https://github.com/rudnovd/laundry-labels-app-api/commit/560bb6254b5e08a23a1c9b094917fc252bb7b41b))
* **items:** update items api ([52d3d0f](https://github.com/rudnovd/laundry-labels-app-api/commit/52d3d0f5ab02adcd1bbebf91c38d77b298e87d5d))
* **models:** add images validation for items ([2830b9f](https://github.com/rudnovd/laundry-labels-app-api/commit/2830b9fc48694127f25b5cd75142a632c04a9445))
* **router:** add /api route ([2fa55d3](https://github.com/rudnovd/laundry-labels-app-api/commit/2fa55d3361444727db805d8ba6a2e98a7ee51169))
* **upload:** use buffer when upload file ([041b50e](https://github.com/rudnovd/laundry-labels-app-api/commit/041b50e78d456713e998dc9ef1f0c193aa60ab6b))


### Bug Fixes

* **cloudinary:** fix async function catching ([fbc730b](https://github.com/rudnovd/laundry-labels-app-api/commit/fbc730b5dc2965d423b74e4226271c14b09e0783))
* **redis:** fix config ([9343f0e](https://github.com/rudnovd/laundry-labels-app-api/commit/9343f0ed9678f6a907d605037dc8c8f76ef6c320))

## [0.0.0-alpha.2](https://github.com/rudnovd/laundry-labels-app-api/compare/v0.0.0-alpha.1...v0.0.0-alpha.2) (2022-06-22)


### Features

* add cloudinary functions ([9210f7e](https://github.com/rudnovd/laundry-labels-app-api/commit/9210f7ef1600671c29a933edff4045f18ae65eba))
* add DATABASE_URI to env ([cff8fd2](https://github.com/rudnovd/laundry-labels-app-api/commit/cff8fd25c24f79a26da473be21a3c31577c259af))
* add limits for express-fileupload ([3c8d486](https://github.com/rudnovd/laundry-labels-app-api/commit/3c8d48610a9cc10ec97e1863303dfb110fcbd76b))
* **items:** add items limit validation ([d46c498](https://github.com/rudnovd/laundry-labels-app-api/commit/d46c498e3e5bfe084c6d33b8f02c12b9dddfac01))
* **items:** use cloudinary instead local drive ([e3a1728](https://github.com/rudnovd/laundry-labels-app-api/commit/e3a17285c6ddc9bcf7687909a582f2bc34a714a3))
* **redis:** add redis password in createClient ([d9f0380](https://github.com/rudnovd/laundry-labels-app-api/commit/d9f03800d49c1fa4212092b4cf5cda3c14e267c5))
* update file limit size ([98cd21e](https://github.com/rudnovd/laundry-labels-app-api/commit/98cd21ed361b349bb1d95717d16cd32f3603956d))
* update redis job ([875f748](https://github.com/rudnovd/laundry-labels-app-api/commit/875f748e9dd5b06fda66f56d9a88fee98caa8819))


### Bug Fixes

* **api:** fix deleteItem function ([1ca3744](https://github.com/rudnovd/laundry-labels-app-api/commit/1ca37441cbb598052ce02280d9ce8ab7ed1feaf3))
* **api:** fix path in deleteItem function ([dc87dd8](https://github.com/rudnovd/laundry-labels-app-api/commit/dc87dd868ac421b714f78f8d9a81e9f8ac1205be))
* **auth:** fix email validation ([e52df4f](https://github.com/rudnovd/laundry-labels-app-api/commit/e52df4f4be68e50235efe7f8c74c1a3cafeb7074))
* **docker:** fix certbot-service command ([830c86b](https://github.com/rudnovd/laundry-labels-app-api/commit/830c86b3e58f6b97a62cb0dd64bb8be8fb1eff08))
* **index:** fix types ([93ccaae](https://github.com/rudnovd/laundry-labels-app-api/commit/93ccaaee9f3c6016c4584c1f80bee1daec63f204))
* **redis:** remove quit after redis error event ([efa8440](https://github.com/rudnovd/laundry-labels-app-api/commit/efa844026f6e32a05d8f6276cb77beb9b59aa1ed))
* **types:** change express request types ([27a0e33](https://github.com/rudnovd/laundry-labels-app-api/commit/27a0e338dff89e20e5a500594b0e74899c1e66cc))

## [0.0.0-alpha.1](https://github.com/rudnovd/laundry-labels-app-api/compare/v0.0.0-alpha.0...v0.0.0-alpha.1) (2021-11-30)


### Bug Fixes

* **index:** global error handler function ([51db37a](https://github.com/rudnovd/laundry-labels-app-api/commit/51db37a077ea8993e825e8d784e6df43b128f638))
* **redis:** check fs.access with F_OK mode ([1a56c6c](https://github.com/rudnovd/laundry-labels-app-api/commit/1a56c6c74ce4943caef7994145b0b87f735d883d))
* **upload:** get image route ([af90029](https://github.com/rudnovd/laundry-labels-app-api/commit/af900293b69e2140dc83a2df763c72d1b24a589f))

## [0.0.0-alpha.0](https://github.com/rudnovd/laundry-labels-app-api/compare/v0.0.0...v0.0.0-alpha.0) (2021-11-28)

### Features

- **auth:** generate tokens in registation route ([239ce91](https://github.com/rudnovd/laundry-labels-app-api/commit/239ce91322e1bb837c19801636c407378f4577bc))

### Bug Fixes

- **auth:** registration password validation ([a0cbc55](https://github.com/rudnovd/laundry-labels-app-api/commit/a0cbc55e4dd37b953b471ef409d2e75e450ff895))
