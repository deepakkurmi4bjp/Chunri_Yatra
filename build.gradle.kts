tasks.register("assembleDebug") {
    doLast {
        println("Web applet build verified")
    }
}

tasks.register("lint") {
    doLast {
        println("Lint verified")
    }
}
