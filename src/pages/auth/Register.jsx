import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';
import axiosClient from '../../lib/axiosClient';

import styles from './AuthPage.module.css';

function Register() {
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, cartId } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (values.password !== values.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await axiosClient.post('/auth/register', {
        email: values.email.trim(),
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        guestCartId: cartId ?? undefined,
      });
      login(res.data);

      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Semana 12</p>
        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.subtitle}>Registra tu usuario para acceder a la tienda.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Nombre</span>
            <input
              className={styles.input}
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              placeholder="Ejemplo: Ana"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Apellido</span>
            <input
              className={styles.input}
              name="lastName"
              value={values.lastName}
              onChange={handleChange}
              placeholder="Ejemplo: Gómez"
            />
          </label>

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

          <label className={styles.field}>
            <span className={styles.label}>Confirmar contraseña</span>
            <input
              className={styles.input}
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              placeholder="Repite la contraseña"
              type="password"
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" className={styles.primaryButton} disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className={styles.helperText}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>.
        </p>
      </div>
    </section>
  );
}

export default Register;
