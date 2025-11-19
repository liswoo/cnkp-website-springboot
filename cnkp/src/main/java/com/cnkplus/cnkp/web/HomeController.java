package com.cnkplus.cnkp.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "index";   // templates/index.html
    }

    @GetMapping("/hi")
    @ResponseBody
    public String hi() {
        return "hello";
    }
}