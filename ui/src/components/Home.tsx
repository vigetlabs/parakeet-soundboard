import { useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  useEffect(() => {
    console.log(`Login mounted`);
  }, []);

  return (
    <>
      <div className="Login-component">Home</div>
      You're not logged in!
      <Link to="/login"> Log in</Link>
    </>
  );
};

export default Home;
