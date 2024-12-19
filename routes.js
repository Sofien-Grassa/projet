const regestration_users_Controller = require('./controllers/regestration_users.controller')
const login_users_controller = require('./controllers/login_users.controller')
const upload_cv_controller = require('./controllers/upload_cv.controller')
const passwordResetController = require('./controllers/password_reset.controller');
const { upload_cv, upload } = require('./controllers/upload_cv.controller');
const test_cv = require('./controllers/test_cv.controller')
const emploiController = require('./controllers/emploi.controller');

module.exports = (server) => {
    server.post('/register_users', regestration_users_Controller.register);
    server.get('/verify', regestration_users_Controller.verifier);
    server.post('/login_users', login_users_controller.login);
    server.post('/forgot_password', passwordResetController.requestPasswordReset); // Demande de réinitialisation
    server.post('/reset_password', passwordResetController.resetPassword);         // Réinitialisation
    server.post('/upload_cv', upload.single('file'), upload_cv);
    server.get('/get_cv_by_email', upload_cv_controller.getCvByEmail);                // Récupérer les CV par email
    server.delete('/delete_cv/:id', upload_cv_controller.deleteCv); // Nouvelle route pour supprimer un CV
    server.get('/get_skills_by_email', test_cv.getCvSkillsByEmail);                // Récupérer les CV par email
    server.post('/testResultat', test_cv.save_test);         // Réinitialisation
    server.get('/get_test_results_by_email', test_cv.getTestResultsByEmail); // Nouvelle route
    server.get('/skills_sucess', test_cv.getEligibleSkills);
    server.post('/create_emploi', emploiController.createEmploi); // Route pour ajouter un emploi
    server.get('/get_emplois', emploiController.getEmplois);
    server.get("/get_test_results_paginated", test_cv.getTestResultsPaginated);

};
