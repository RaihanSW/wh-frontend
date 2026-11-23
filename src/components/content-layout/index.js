import React, { createContext, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Nav from "../user-control/nav";
// import Footer from "../user-control/footer";
import Loadable from 'react-loadable';

const Loading = () => null;

// const DashboardFlet = Loadable({
//     loader: () => import("../apps-library/dashboard/fleet"),
//     loading: Loading
// });

// const MasterFleetDetail = Loadable({
//     loader: () => import("../apps-library/masters/fleet/detail"),
//     loading: Loading
// });

// Import LandingPage - CORRECTED PATH
const LandingPage = Loadable({
    loader: () => import("../landingpage"),
    loading: Loading
});

const MasterBank = Loadable({
    loader: () => import("../apps-library/masters/bank/"),
    loading: Loading
});

const MasterFAQList = Loadable({
    loader: () => import("../apps-library/masters/faq/list/"),
    loading: Loading
});

const MasterFAQDetailList = Loadable({
    loader: () => import("../apps-library/masters/faqdetail/list/"),
    loading: Loading
});

const MasterFAQDetailEntry = Loadable({
    loader: () => import("../apps-library/masters/faqdetail/detail/"),
    loading: Loading
});

const ListPengajuanKlaim = Loadable({
    loader: () => import("../apps-library/operations/claim/"),
    loading: Loading
});

const PelunasanKlaim = Loadable({
    loader: () => import("../apps-library/operations/claim/pelunanasanclaim/"),
    loading: Loading
});

const PelunasanKlaimDetail = Loadable({
    loader: () => import("../apps-library/operations/claim/pelunanasanclaim/detail/"),
    loading: Loading
});

const AccPengajuanKlaim = Loadable({
    loader: () => import("../apps-library/operations/acc-pengajuan-claim/"),
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

const InventarisKlaim = Loadable({
    loader: () => import("../apps-library/operations/claim/inventarisclaim"),
    loading: Loading
});

const InventarisKlaimDetail = Loadable({
    loader: () => import("../apps-library/operations/claim/inventarisclaim/detail"),
    loading: Loading
});

const DashboardKurir = Loadable({
    loader: () => import("../apps-library/dashboard/kurir/"),
    loading: Loading
});

const DashboardList = Loadable({
    loader: () => import("../apps-library/dashboard/list/"),
    loading: Loading
});

const DashboardTrail = Loadable({
    loader: () => import("../apps-library/dashboard/trail"),
    loading: Loading
});

const DashboardTrailDetail = Loadable({
    loader: () => import("../apps-library/dashboard/trail"),
    loading: Loading
});

// const MasterFleet = Loadable({
//     loader: () => import("../apps-library/masters/fleet/"),
//     loading: Loading
// });

const MasterQR = Loadable({
    loader: () => import("../apps-library/masters/print-qr/"),
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

const ListDo = Loadable({
    loader: () => import("../apps-library/dashboard/kurir/deliveryorder"),
    loading: Loading
});

const ResiDetails = Loadable({
    loader: () => import("../apps-library/dashboard/kurir/deliveryorder/resi"),
    loading: Loading
});

const TicketLists = Loadable({
    loader: () => import("../apps-library/operations/ticket/list"),
    loading: Loading
});

const TicketListDetail = Loadable({
    loader: () => import("../apps-library/operations/ticket/detail"),
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
                <Route path="/landingpage" element={<LandingPage />} />
                <Route path="/Operations/Claim" element={<ListPengajuanKlaim />} />
                <Route path="/Operations/Tickets/List" element={<TicketLists />} />
                <Route path="/Operations/Tickets/Detail/:id" element={<TicketListDetail />} />
                <Route path="/Operations/Claim/Inventory" element={<InventarisKlaim />} />
                <Route path="/Operations/Claim/Inventory/Detail/:id" element={<InventarisKlaimDetail />} />
                <Route path="/Operations/Claim/Payment/" element={<PelunasanKlaim/>} />
                <Route path="/Operations/Claim/Payment/Detail" element={<PelunasanKlaimDetail/>} />
                <Route path="/Operations/Claim/List/:id" element={<PengajuanKlaimList />} />
                <Route path="/Operations/Claim/Detail" element={<PengajuanKlaimDetail />} />
                <Route path="/Operations/AccPengajuanKlaim" element={<AccPengajuanKlaim />} />
                
                
                {/* <Route path="/Dashboard/Fleet" element={<DashboardFleet />} /> */}
                <Route path="/Dashboard/Kurir" element={<DashboardKurir />} />
                <Route path="/Dashboard/Kurir/ListDo/:code" element={<ListDo />} />
                <Route path="/Dashboard/List" element={<DashboardList/>} />
                <Route path="/Dashboard/Trail" element={<DashboardTrail />} />
                <Route path="/Dashboard/Trail/Detail/:platNumber" element={<DashboardTrailDetail />} />
                <Route path="/Dashboard/Trail/:platNumber" element={<DashboardTrailDetail />} />
                <Route path="/Master/QR" element={<MasterQR/>} />
                {/* <Route path="/Master/Fleet" element={<MasterFleet/>} /> */}
                {/* <Route path="/Master/Fleet/Detail/:id" element={<MasterFleetDetail/>} /> */}
                <Route path="/Master/Bank" element={<MasterBank/>} />
                <Route path="/Master/FAQ/List" element={<MasterFAQList/>} />
                <Route path="/Master/FAQDetail/List/:id" element={<MasterFAQDetailList/>} />
                <Route path="/Master/FAQDetail/Detail/:id" element={<MasterFAQDetailEntry/>} />


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
                <Route path="/Dashboard/Kurir/ListDo/:code/resi/:resi" element={<ResiDetails />} />
            </Routes>
            </div>           
            {/* <Footer />   */}
        </NavContext.Provider>
    </div>
    
)
 }
export default ContentLayout;