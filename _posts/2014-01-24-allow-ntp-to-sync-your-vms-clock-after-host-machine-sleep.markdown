---
layout: article
title: "Allow NTP to sync your VM’s clock after host machine sleep"
---

At Browser we use NTP on our Linux VMs to automatically check and update the server’s date/time. This is particularly important if you’re working with tools such as the Amazon AWS SDK, which will fail (sometimes fairly quietly) if your server clock is more than 15 minutes different from Amazon’s. We install the standard NTP service on our Ubuntu machines using `sudo apt-get install ntp`.

NTP is designed to counter the effects of server clock drift, which usually occurs in very small amounts. By default, the `ntpd` daemon is designed to ‘panic’ and exit if it notices the clock has slipped by an abnormally large amount (1000 seconds by default).

This becomes a problem when you’re running NTP on a VM and you want to put your host machine to sleep—when you arrive back from lunch or come into work the next day, you’ll find the VM clock is many hours behind and unable to recover.

To make sure NTP can **always** recover—regardless of the amount of drift—add `tinker panic 0` to a new line at the _top_ of your `ntp.conf` file (which is `/etc/ntp.conf` by default) and restart the service (`sudo service ntp restart`). The position of the line seems to make a difference, so make sure it’s the first non-comment line in the file.

---

As an aside, we use shell provisioning for our VMs, so we can add a line like this to our provisioning script to make sure NTP is configured with `tinker panic 0` as standard:

```sh
sudo sed -i '3i# Allow NTP to adjust large time differences, e.g. after host machine is woken from sleep\ntinker panic 0\n' /etc/ntp.conf
```
