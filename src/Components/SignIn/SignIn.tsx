import { useState } from 'react';
import { signIn } from '../../api/api';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SignIn = () => {
  interface IState {
    username: string;
    password: string;
    loading: boolean;
    message: string;
  }

  const initialState = {
    username: '',
    password: '',
    loading: false,
    message: '',
  };

  const [state, setState] = useState<IState>(initialState);

  function validationSchema() {
    return Yup.object().shape({
      username: Yup.string().required('This field is required!'),
      password: Yup.string().required('This field is required!'),
    });
  }

  function handleLogin(formValue: { username: string; password: string }) {
    const { username, password } = formValue;
    setState({ ...state, message: '', loading: true });

    signIn(username, password).then(
      () => {
        setState({
          ...state,
          loading: false
        });
        // this.props.history.push('/profile');
        // window.location.reload();
      },
      (error) => {
        const resMessage =
          (error.response && error.response.data && error.response.data.message) ||
          error.message ||
          error.toString();
        setState({
          ...state,
          loading: false,
          message: resMessage,
        });
      }
    );
  }

  return (
    <div className="col-md-12">
        <div className="card card-container">
          <Formik
            initialValues={initialState}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            <Form>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <Field name="username" type="text" className="form-control" />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="alert alert-danger"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Field name="password" type="password" className="form-control" />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="alert alert-danger"
                />
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-primary btn-block" disabled={state.loading}>
                  {state.loading && (
                    <span className="spinner-border spinner-border-sm"></span>
                  )}
                  <span>Login</span>
                </button>
              </div>
              {state.message && (
                <div className="form-group">
                  <div className="alert alert-danger" role="alert">
                    {state.message}
                  </div>
                </div>
              )}
            </Form>
          </Formik>
        </div>
      </div>
  );
};

export default SignIn;
