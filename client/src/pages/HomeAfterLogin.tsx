import { MainNav } from "../components/MainNav"
import { AppSidebar } from "../components/AppSidebar"
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar"

const HomeAfterLogin = () => {
    return (
        <SidebarProvider>
            <div className="grid h-20 w-full lg:grid-cols-[auto_1fr]">
                <AppSidebar />
                <div className="flex flex-col h-fit">
                    <header className="border-b border-border">
                        <div className="flex h-16 items-center px-4 gap-4">
                            <SidebarTrigger />
                            <div className="flex items-center gap-2 mr-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                    <span className="text-lg font-bold text-primary-foreground">RF</span>
                                </div>
                                <span className="font-semibold text-xl text-foreground">React Finance</span>
                            </div>
                            <MainNav />
                        </div>
                    </header>
                </div>
            </div>
        </SidebarProvider>
    )
}

export default HomeAfterLogin