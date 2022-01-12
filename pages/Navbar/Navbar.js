import React from "react";
import styled from "styled-components";

const Nav = styled.div`
  background-color: #67bc9b;
  height: 100vh;
`;
const Logo = styled.a`

`;
const Hambuger = styled.div`
    
`
const Navbar = () => {
  return (
    <div>
      <Nav>
        <Logo>Logo goes Here</Logo>
      </Nav>
    </div>
  );
};

export default Navbar;
