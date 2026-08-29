"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;

    const sidebar =
        document.querySelector("nav");

    const sidebarToggle =
        document.querySelector(
            ".sidebar-toggle"
        );

    const modeToggle =
        document.querySelector(
            ".mode-toggle"
        );


    /* ================================
       SIDEBAR
       ================================= */

    if (sidebar && sidebarToggle) {

        const savedStatus =
            localStorage.getItem(
                "stockflow_sidebar"
            );

        if (savedStatus === "closed") {
            sidebar.classList.add("close");
        }

        sidebarToggle.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                sidebar.classList.toggle(
                    "close"
                );

                localStorage.setItem(
                    "stockflow_sidebar",
                    sidebar.classList.contains("close")
                        ? "closed"
                        : "open"
                );

                window.dispatchEvent(
                    new Event("resize")
                );
            }
        );
    }


    /* ================================
       DARK MODE
       ================================= */

    if (modeToggle) {

        const savedMode =
            localStorage.getItem(
                "stockflow_mode"
            );

        if (savedMode === "dark") {
            body.classList.add("dark");
        }

        modeToggle.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                body.classList.toggle(
                    "dark"
                );

                localStorage.setItem(
                    "stockflow_mode",
                    body.classList.contains("dark")
                        ? "dark"
                        : "light"
                );
            }
        );
    }

});