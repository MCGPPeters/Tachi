using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Owin;
using Microsoft.Owin.Builder;
using Owin;
using MidFunc = System.Func
    <System.Func<System.Collections.Generic.IDictionary<string, object>, System.Threading.Tasks.Task>,
        System.Func<System.Collections.Generic.IDictionary<string, object>, System.Threading.Tasks.Task>
        >;

namespace eVision.InteractivePnid.Tests.Fixtures
{
    public class Startup : TestableOwinEdgeApplication
    {
        public Startup()
        {
            IAppBuilder app = new AppBuilder();
            app.Use(Middleware);
            AppFunc = app.Build();
        }

        public MidFunc Middleware
        {
            get
            {
                return
                    next =>
                        env =>
                        {
                            var owinContext = new OwinContext(env);
                            var responders = new Dictionary<string, Action<IOwinContext>>
                            {
                                {"/OK", context => context.Response.StatusCode = 200},
                                {"/NotFound", context => context.Response.StatusCode = 404},
                                {
                                    "/greeting", context =>
                                    {
                                        var form = context.Request.ReadFormAsync().Result;
                                        context.Response.Write("Hello " + form["Name"]);
                                    }
                                }
                            };

                            responders[owinContext.Request.Path.Value](owinContext);
                            return Task.FromResult(0);
                        };
            }
        }
    }
}