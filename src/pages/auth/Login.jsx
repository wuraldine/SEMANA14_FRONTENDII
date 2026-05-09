import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';
import axiosClient from '../../lib/axiosClient';

import styles from './AuthPage.module.css';

function Login() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, cartId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axiosClient.post('/auth/login', {
        email: values.email.trim(),
        password: values.password,
        guestCartId: cartId ?? undefined,
      });

      login(res.data);

      const from = location.state?.from ?? '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Credenciales inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Semana 12</p>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>Accede con tu cuenta para continuar.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Correo electrónico</span>
            <input
              className={styles.input}
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="correo@dominio.com"
              type="email"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Contraseña</span>
            <input
              className={styles.input}
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              type="password"
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" className={styles.primaryButton} disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className={styles.helperText}>
          ¿Todavía no tienes cuenta? <Link to="/register">Regístrate aquí</Link>.
        </p>
      </div>
    </section>
  );
}

export default Login;
