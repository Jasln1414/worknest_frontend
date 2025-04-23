import * as Yup from 'yup';


export const initialValues = {
    date:"",
}

Yup.addMethod(Yup.string, 'futureDate', function (errorMessage) {
    return this.test('futureDate', errorMessage, function (value) {
        const { path, createError } = this;
        if (!value) {
            return true;
        }
        const currentDate = new Date();
        const scheduledDate = new Date(value);
        return scheduledDate > currentDate || createError({ path, message: errorMessage });
    });
});

export const SheduleValidationSchema = Yup.object().shape({
    date:Yup.string()
        .required('Required')   
        .futureDate('The scheduled time must be in the future'),
})