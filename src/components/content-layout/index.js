import React, { createContext, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Nav from "../user-control/nav";
// import Footer from "../user-control/footer";
import Loadable from 'react-loadable';

const Loading = () => null;


const ListPengajuanKlaim = Loadable({
    loader: () => import("../apps-library/operations/claim/"),
    loading: Loading
});

const PengajuanKlaimList = Loadable({
    loader: () => import("../apps-library/operations/claim/list"),
    loading: Loading
});

const PengajuanKlaimDetail = Loadable({
    loader: () => import("../apps-library/operations/claim/detail"),
    loading: Loading
});

const DashboardStorage = Loadable({
    loader: () => import("../apps-library/dashboard/storage/"),
    loading: Loading
});

const MenuWebmenuList = Loadable({
    loader: () => import("../apps-library/menu/webmenu/list/"),
    loading: Loading
});

const MenuWebmenuDetail = Loadable({
    loader: () => import("../apps-library/menu/webmenu/detail/"),
    loading: Loading
});

const AccessRoleList = Loadable({
    loader: () => import("../apps-library/users/access-role/list/"),
    loading: Loading
});

const AccessRoleDetail = Loadable({
    loader: () => import("../apps-library/users/access-role/detail/"),
    loading: Loading
});

const AccessUserList = Loadable({
    loader: () => import("../apps-library/users/access-user/list/"),
    loading: Loading
});

const AccessUserDetail = Loadable({
    loader: () => import("../apps-library/users/access-user/detail/"),
    loading: Loading
});

const RoleList = Loadable({
    loader: () => import("../apps-library/users/role/list/"),
    loading: Loading
});

const Roledetail = Loadable({
    loader: () => import("../apps-library/users/role/detail/"),
    loading: Loading
});

const UserDetail = Loadable({
    loader: () => import("../apps-library/users/user/detail"),
    loading: Loading
});

const UserList = Loadable({
    loader: () => import("../apps-library/users/user/list"),
    loading: Loading
});


export const NavContext = createContext(null);

const ContentLayout = () => {
    const [navData, setNavData] = useState({ 
        hide: false, 
        th: false, 
        transparent: false, 
        blur: false,
        separator: false,
        textColor: 'text-black',
    });

    const navSetData = {
        setNavData: setNavData
    }

return (
    <div className={"leading-normal tracking-normal text-white font-inter flex min-h-screen bg-[#EAF2FE]"}>
        <NavContext.Provider value={{ navData, navSetData }}>
            <div className={(navData.hide ? 'hidden' : '')}>
                <Nav />
            </div>
            <div className="flex-grow">
            <Routes>
                {/* LandingPage Route */}
                <Route path="/Operations/Claim" element={<ListPengajuanKlaim />} />
                <Route path="/Operations/Claim/List/:id" element={<PengajuanKlaimList />} />
                <Route path="/Operations/Claim/Detail" element={<PengajuanKlaimDetail />} />
                
                {/* <Route path="/Dashboard/Fleet" element={<DashboardFleet />} /> */}
                <Route path="/Dashboard/Storage" element={<DashboardStorage />} />

                <Route path="/Menu/Webmenu/List" element={<MenuWebmenuList/>} />
                <Route path="/Menu/Webmenu/Detail/:id" element={<MenuWebmenuDetail/>} />
                <Route path="/Users/Accessrole/List" element={<AccessRoleList/>} />
                <Route path="/Users/Accessrole/Detail/:id" element={<AccessRoleDetail/>} />
                <Route path="/Users/Accessuser/List" element={<AccessUserList/>} />
                <Route path="/Users/Accessuser/Detail/:uid" element={<AccessUserDetail/>} />  
                <Route path="/Users/Role/List" element={<RoleList/>} />
                <Route path="/Users/Role/Detail/:id" element={<Roledetail/>} />
                <Route path="/Users/User/Detail/:uid" element={<UserDetail/>} />
                <Route path="/Users/User/List" element={<UserList/>} />
            </Routes>
            </div>           
            {/* <Footer />   */}
        </NavContext.Provider>
    </div>
    
)
 }
export default ContentLayout;